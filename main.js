
// MAP

var map;
var infoBulle = null;

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 48.856578, lng: 2.351828},
    zoom: 11,
  });
  var stations = Object.create(StationsObject);
  stations.init(map);

  infoBulle = new google.maps.InfoWindow({
    content: "loading..."
  });
}

var Station = {
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
    this.reserve = false;
    this.contentInfoBulle = 
    '<h2>'+this.name+'</h2>';

      // créer le marker
      this.marker = new google.maps.Marker({
        position: {lat: this.position[0], lng: this.position[1]},
        map: map,
        icon: '',
        title: this.name, 
        html: this.contentInfoBulle,
        station: this
      });

      // choisir l'icon
      if (this.reserve == true) {
        this.marker.icon = 'images/closed.png';
      }
      else if (this.status == 'CLOSED') {
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
      google.maps.event.addListener(this.marker, "click",  function() {
        $('html,body').animate({scrollTop: $("#map").offset().top}, 'slow'      );
        $('#station-infos').css('display', 'block');
        infoBulle.setContent(this.html);
        infoBulle.open(map, this);
        $('.info').attr('id', this.station.number);
        if (this.status == 'CLOSED') {
         $('#statut').text('station fermée');
       }
       else {
         $('#statut').text('station ouverte');
       }
       $('#name').text(this.station.name);
       $('#address').text(this.station.address);
       $('#velosDispo').text(this.station.availableBike);
       $('#placesDispo').text(this.station.availableBikeStand);
       $('#placesTotales').text(this.station.bikeStand);
       if (this.station.banking == 'True') {
        $('#paiement').text('Oui');
      }
      else {
        $('#paiement').text('Non');
      }
      if (this.station.bonus == 'True') {
        $('#bonus').text('Oui');
      }
      else {
        $('#bonus').text('Non');
      }
      if (this.station.availableBike == 0) {
        $('#bouton-reservation').css('display', 'none');
      }
      else {
        $('#bouton-reservation').css('display', 'block');
        $('#div-signature').css('display', 'none');
        $('#bouton-reservation').text('Cliquer ici pour réserver un vélo');
      }
      $('#guide-station').css('display', "none");
    });

  },
};


var StationsObject =  {
  init: function (map) {
    this.stationsArray = [];
    this.markers = [];
    this.infoBulles = [];
    this.stationReserve = '';

    this.stationsArray = this.getStations(map);
    this.stationReserve = Object.create(Reservation);
    this.stationReserve.init();
    this.createMarkers(this.stationsArray, this.stationReserve.idStation);
  },


  getStations: function (map) {
    var array = []; 
    var markerCluster = new MarkerClusterer(map, this.markers, {imagePath: 'images/m'}) ;
    $.ajax({

      url : 'https://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=1234',
      method : 'GET',
      async: false,
      success : function(data){

        for (var i = 0; i < data.records.length; i++) {

          var station = data.records[i].fields;
          stationNew = Object.create(Station);
          stationNew.init(station.number, station.name, station.address, station.banking, station.bonus, station.status, station.position, station.bike_stands, station.available_bike_stands, station.available_bikes);
          markerCluster.addMarker(stationNew.marker);
          array.push(stationNew);
        }
      }
    })
    return array;    
  },

  createMarkers: function (stations, idStationReserve) {
   for (var i = 0; i < stations.length; i++) {
      station = stations[i];
      if (idStationReserve != 0) {
        station.reserve = true;
      }
      this.markers.push(station.marker);
    }
  }

};



var Reservation = {

  // Initialise la station
  init: function () {
    this.idStation = sessionStorage.getItem('idStation');
    this.nomStation = sessionStorage.getItem('nomStation');
    this.datetimeReservation = sessionStorage.getItem('datetimeReservation');
    this.tempsPasse = new Date().getTime() -  this.datetimeReservation;
    this.reservationForm();
    this.checkTime();
    this.checkReservation();
  },

  checkTime: function() {
    if (this.tempsPasse > 20 * 60 * 1000) {
     sessionStorage.clear();
    }
  },

  checkReservation: function() {
    if (sessionStorage.length == 0) {
      $('#reservationEnCours').text('Aucune réservation en cours');
      $('#reservationEnCours2').text('Pas de vélo réservé');
    }
    else {
      $('#reservationEnCours2').text('1 vélo réservé');
      setInterval(this.affichageReservation, 1000);

    }
  },

  affichageReservation: function() {

    var tempsPasse = new Date().getTime() -  sessionStorage.getItem('datetimeReservation');
    var tempsRestant = 20 * 60 * 1000 - tempsPasse;
    var minutes = Math.floor(tempsRestant/60000);
    var secondes = Math.floor((tempsRestant - minutes * 60 * 1000)/1000);
    $('#reservationEnCours').text('Vélo réservé station ' + sessionStorage.getItem('nomStation') + ' pour ' + minutes + 'min et ' + secondes + 's');


  },

  reservationForm: function() {
    var self = this;
    var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: 'rgb(0, 0, 0)'
    });

    $('#reserver').on('click', function (event) {
      var stationNumber = $('.info').attr('id');
      var nomStation = $('#name').text();
      if (signaturePad.isEmpty() == false ) {

        if (sessionStorage.length == 0) {
          sessionStorage.setItem('idStation', stationNumber);
          sessionStorage.setItem('datetimeReservation', new Date().getTime());
          sessionStorage.setItem('nomStation', nomStation);
          $('#reservationEnCours2').text('1 vélo réservé');
          self.affichageReservation();
        }
        else {
          sessionStorage.setItem('idStation', stationNumber);
          sessionStorage.setItem('datetimeReservation', new Date().getTime());
          sessionStorage.setItem('nomStation', nomStation);
          self.affichageReservation();
          $('#reservationEnCours2').text('1 vélo réservé');
          alert('Votre nouvelle réservation a remplacé l\'ancienne');
        }


      }
      else {
        alert('Vous n\'avez pas signé');
      }

    });

    $('#effacer').on('click', function (event) {
      signaturePad.clear();
    }); 
  }
};

$('#bouton-reservation').click(function() {
  $('#div-signature').toggle();
  if ($('#div-signature').css('display') == 'none') {
    $('#bouton-reservation').text('Cliquer ici pour réserver un vélo');
  }
  else {
    $('#bouton-reservation').text('Annuler');
    $('#guide-station').css('display', 'none');
  }
});

// SLIDER

var images = [
"images/slide1.png", 
"images/slide2.png", 
"images/slide3.png", 
"images/slide4.png", 
"images/slide5.png"
];
var num = 0;

function next() {
  var slider = document.getElementById("slider");
  num++;
  if ( num >= images.length ) {
    num = 0;
  }
  slider.src = images[num];
}

function prev() {
  var slider = document.getElementById("slider");
  num--;
  if ( num < 0 ) {
    num = images.length-1;
  }
  slider.src = images[num];
}



$('#btnNext').click(function() {
  next();
});

$('#btnPrev').click(function() {
  prev();
});

document.addEventListener("keydown", function(e){
  if(e.keyCode === 37){
    prev();
  }
  else if(e.keyCode === 39){
    next();
  }
});