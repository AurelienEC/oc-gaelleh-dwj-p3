// OPEN DATA PARIS 

var Station = {
	// Initialise la station
	init: function (number, name, address, banking, bonus, status, position, bikeStand, availableBikeStand, availableBike) {
		this.number = number;
  		this.name = name;
  		this.address = address;
  		this.banking = banking;
  		this.bonus = bonus;
  		this.status = status;
  		this.position = position;
  		this.bikeStand =  bikeStand;
  		this.availableBikeStand = availableBikeStand;
  		this.availableBike = availableBike;
	}



};


var stations = []; // charger stations -> faire un appel puis boucle pour creer chaque stations


	$.ajax({
		url : 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1234',
		method : 'GET',
    	async: false,
		success : function(data){
			
			for (var i = 0; i < data.records.length; i++) {
				var station = data.records[i].fields;
				stations[i] = Object.create(Station);
				stations[i].init(station.number, station.name, station.address, station.banking, station.bonus, station.status, station.position, station.bike_stands, station.available_bike_stands, station.available_bikes);
			}
			return stations;
		}			
	});

// RESERVATIONS



// MAP

var map;
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856578, lng: 2.351828},
    zoom: 12
  });

  var markers = [];
  for (var i = 0; i < stations.length; i++) {
    var station = stations[i];
    if (station.status == 'CLOSED') {
      var marker = new google.maps.Marker({
        position: {lat: station.position[0], lng: station.position[1]},
        map: map,
        icon: 'images/closed.png',
        title: station.name
      });
    }
    else if(station.availableBike == 0) {
      var marker = new google.maps.Marker({
        position: {lat: station.position[0], lng: station.position[1]},
        map: map,
        icon: 'images/full.png',
        title: station.name
      });     
    }
    else if(station.availableBikeStand == 0) {
      var marker = new google.maps.Marker({
        position: {lat: station.position[0], lng: station.position[1]},
        map: map,
        icon: 'images/empty.png',
        title: station.name
      });     
    }
    else {
      var marker = new google.maps.Marker({
        position: {lat: station.position[0], lng: station.position[1]},
        map: map,
        icon: 'images/open.png',
        title: station.name
      });     
    }
    markers.push(marker);
  }
  var markerCluster = new MarkerClusterer(map, markers,
    {imagePath: 'images/m'});
      
}

