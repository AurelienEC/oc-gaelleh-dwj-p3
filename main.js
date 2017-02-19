// OPEN DATA PARIS 

var Station = {
	// Initialise la station
	init: function (number, name, address, banking, bonus, status, position, bikeStand, availableBikeStand, availableStand) {
		this.number = number;
  		this.name = name;
  		this.address = address;
  		this.banking = banking;
  		this.bonus = bonus;
  		this.status = status;
  		this.position = position;
  		this.bikeStand =  bikeStand;
  		this.availableBikeStand = availableBikeStand;
  		this.availableStand = availableStand;
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
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856578, lng: 2.351828},
    zoom: 12
  });
  var markers = setMarkers(map);

}

function setMarkers(map) {
  // Adds markers to the map.

  // Marker sizes are expressed as a Size of X,Y where the origin of the image
  // (0,0) is located in the top left of the image.

  // Origins, anchor positions and coordinates of the marker increase in the X
  // direction to the right and in the Y direction down.
  // var image = {
  //   //url: 'images/beachflag.png',
  //   // This marker is 20 pixels wide by 32 pixels high.
  //   size: new google.maps.Size(20, 32),
  //   // The origin for this image is (0, 0).
  //   origin: new google.maps.Point(0, 0),
  //   // The anchor for this image is the base of the flagpole at (0, 32).
  //   anchor: new google.maps.Point(0, 32)
  // };
  // Shapes define the clickable region of the icon. The type defines an HTML
  // <area> element 'poly' which traces out a polygon as a series of X,Y points.
  // The final coordinate closes the poly by connecting to the first coordinate.
  // var shape = {
  //   coords: [1, 1, 1, 20, 18, 20, 18, 1],
  //   type: 'poly'
  // };
  for (var i = 0; i < stations.length; i++) {
    var station = stations[i];
    var marker = new google.maps.Marker({
      position: {lat: station.position[0], lng: station.position[1]},
      map: map,
      //icon: image,
      //shape: shape,
      title: station.name
      //zIndex: beach[3]
    });
  }
}
