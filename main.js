
// MAP

var map;

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856578, lng: 2.351828},
    zoom: 12,

  });
  var stations = Object.create(StationsObject);
  stations.init();

  var markerCluster = new MarkerClusterer(map, stations.markers,
     {imagePath: 'images/m'});
      
}

// OPEN DATA PARIS 

var Station = {
	// Initialise la station
	init: function (number, name, address, banking, bonus, status, position, bikeStand, availableBikeStand, availableBike, marker) {
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

      // créer le marker
      this.marker = new google.maps.Marker({
        position: {lat: this.position[0], lng: this.position[1]},
        map: map,
        icon: '',
        title: this.name
      });

      // choisir l'icon
      if (this.status == 'CLOSED') {
        this.marker.icon = 'images/closed.png';
      }
      else if(this.availableBike == 0) {
        this.marker.icon = 'images/full.png';     
      }
      else if(this.availableBikeStand == 0) {
        this.marker.icon = 'images/empty.png';     
      }
      else {
        this.marker.icon = 'images/open.png';     
      }
	}

};


var StationsObject =  {
// charger stations -> faire un appel puis boucle pour creer chaque stations
	init: function () {
    this.stationsArray = [];
    this.markers = [];


    this.stationsArray = this.getStations();
    this.createMarkers(this.stationsArray);
  },


  getStations: function () {
    var array = []; 
    $.ajax({
      url : 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1234',
      method : 'GET',
      async: false,
      success : function(data){
        for (var i = 0; i < data.records.length; i++) {
          var station = data.records[i].fields;
          stationNew = Object.create(Station);
          stationNew.init(station.number, station.name, station.address, station.banking, station.bonus, station.status, station.position, station.bike_stands, station.available_bike_stands, station.available_bikes);
          array.push(stationNew);
        }
      }     
    })
    return array;
  },

  createMarkers: function (stations) {
     for (var i = 0; i < stations.length; i++) {
      station = stations[i];
      this.markers.push(station.marker);
    }
  }
};



