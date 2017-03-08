
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
      google.maps.event.addListener(this.marker, "click",  function() {
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
      });

  },
};






var StationsObject =  {
// charger stations -> faire un appel puis boucle pour creer chaque stations
  init: function (map) {
    this.stationsArray = [];
    this.markers = [];
    this.infoBulles = [];


    this.stationsArray = this.getStations(map);
    this.createMarkers(this.stationsArray);
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

  createMarkers: function (stations) {
     for (var i = 0; i < stations.length; i++) {
      station = stations[i];
      this.markers.push(station.marker);
    }
  }

  
};

// CANVAS

var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
  backgroundColor: 'rgba(255, 255, 255, 0)',
  penColor: 'rgb(0, 0, 0)'
});
var boutonReserver = document.getElementById('reserver');
var boutonEffacer= document.getElementById('effacer');

boutonReserver.addEventListener('click', function (event) {
  var stationNumber = $('.info').attr('id');
  var nomStation = $('#name').text();
  if (sessionStorage.length == 0) {
    stockageReservation(stationNumber, nomStation);
  }
  else {
     stockageReservation(stationNumber, nomStation);
     alert('Votre nouvelle réservation a remplacé l\'ancienne');
  }
});

boutonEffacer.addEventListener('click', function (event) {
  signaturePad.clear();
});


// RESERVATION

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


// STORAGE

function stockageReservation (stationNumber, nomStation) {
  sessionStorage.setItem('idStation', stationNumber);
  sessionStorage.setItem('datetimeReservation', new Date().getTime())
  sessionStorage.setItem('nomStation', nomStation)
  console.log(sessionStorage.getItem('datetimeReservation'));
}
var tempsPasse = new Date().getTime() - sessionStorage.getItem('datetimeReservation');
if (tempsPasse > 20 * 60 * 1000) {
   sessionStorage.clear();
}
if (sessionStorage.length == 0) {
  $('#reservationEnCours').text('Aucune réservation en cours');
}
else {
  var tempsRestant = 20 * 60 * 1000 - tempsPasse;
  var minutes = Math.floor(tempsRestant/60000);
  var secondes = Math.floor((tempsRestant - minutes * 60 * 1000)/1000);
    //console.log(tempsRestant.getSeconds());
  $('#reservationEnCours').text('Vous avez un vélo de réservé à la station ' + sessionStorage.getItem('nomStation') + ' pour ' + minutes + 'min et ' + secondes + 's');
}


// SLIDER

for (var i = 1; i <= 5; i++) {
  $('#slider ul').append('<li class="li' + i + '" ><img src="images/slide' + i + '.png"></li>' );
}

$(function(){
  function next(){
    if(parseInt($("#slider ").css("margin-left"))>-(2000-$(window).width())){ 
      $("#slider").animate({marginLeft: "-="+250+"px"}, 500);
    } 
    else {
      $("#slider ").animate({marginLeft: "0px"}, 500);
    }
  }

  
  function back(){
    if(parseInt($("#slider ").css("margin-left"))<0){
      $("#slider ").animate({marginLeft: "+="+250+"px"}, 500 );
    } 
    else {
      $("#slider ").animate({marginLeft: "0"}, 500);
    }
  }
  
  $(".suivant").click(function(){
    next();
  });
  
  $(".precedent").click(function(){
    back();
  });

  document.addEventListener("keydown", function(e){
    if(e.keyCode === 37){
    back();
    }
    else if(e.keyCode === 39){
    next();
    }
  });
  
});
