function get(url) {
  return new Promise(function(succeed, fail) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.addEventListener("load", function() {
      if (req.status < 400)
        succeed(req.responseText);
      else
        fail(new Error("Request failed: " + req.statusText));
    });
    req.addEventListener("error", function() {
      fail(new Error("Network error"));
    });
    req.send(null);
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse);
}

var map, infoWindow, pos, readings;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 19
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log(pos.lat, "and", pos.lng);
      document.getElementById("coords").innerText = pos.lat + ", " + pos.lng;

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}


function locateUser () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log(pos.lat, "and", pos.lng);
      document.getElementById("coords").innerText = pos.lat + ", " + pos.lng;
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    }, {enableHighAccuracy: "true"});
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function updateMap() {
  try {
    getNewReadings();
    //eqfeed_callback(readings);
  } catch(e) {
    console.log("There was an error: " + e.message);
  }
  
  infoWindow.setPosition(pos);
  infoWindow.setContent('Location found.');
  infoWindow.open(map);
  map.setCenter(pos);
}

function setPosition() {
  pos = {
    lat: parseFloat(document.getElementById("lat").value),
    lng: parseFloat(document.getElementById("lng").value)
  };

  console.log(pos.lat, "and", pos.lng);
  document.getElementById("coords").innerText = pos.lat + ", " + pos.lng;
}

// This function adds the visualization of the pollution on screen.
// This function also assumes the format of the JSON received by the API. Specifically, a format like this:
/*
  
{
  "features": [{
      "lat": 45,
      "lng": 50,
      "level": 300
    }, 
    {
      "lat": 23,
      "lng": 193,
      "level": 300
    },
    {
      "lat": 25,
      "lng": 45,
      "level": 342
    }]
}

*/
function eqfeed_callback(readings) {
  var heatmapData = [];
  for (var i = 0; i < readings.features.length; i++) {
    var lat = readings.features[i].lat;
    var lng = readings.features[i].lng;
    var latLng = new google.maps.LatLng(lat, lng);
    var pollutionLevel = readings.features[i].level;
    var weightedLoc = {
      location: latLng,
      weight: pollutionLevel
    };
    heatmapData.push(weightedLoc);
  }
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    dissipating: false,
    map: map
  });
}

function getNewReadings () {
  readings = getJSON("localhost:3000");
}

 