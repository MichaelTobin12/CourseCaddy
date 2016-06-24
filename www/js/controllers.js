angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('LoginCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $cordovaGeolocation, $interval) {
  $scope.chat = Chats.get($stateParams.chatId);
  var options = {
    timeout: 10000,
    enableHighAccuracy: true
  };
  var currentHole = Chats.get($stateParams.chatId);
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    var pinLatLng = new google.maps.LatLng(currentHole.pinLat, currentHole.pinLng);
    var currentPOS = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    $scope.yrdToHole = (google.maps.geometry.spherical.computeDistanceBetween(currentPOS, pinLatLng) * 1.09361).toFixed(2);
  })
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('MapCtrl', function($scope, $state, $stateParams, Chats, $cordovaGeolocation) {

  function datEventListener(marker,infoWindow){
    google.maps.event.addListener(marker,'click',function(){
      infoWindow.open($scope.map, marker);
    })
  }

  function demMarkersDistanceBetween(obsticleLat,obsticleLng,currentPosition){
    var newLatLng = new google.maps.LatLng(obsticleLat,obsticleLng);
    var distanceBetween = (google.maps.geometry.spherical.computeDistanceBetween(currentPosition, newLatLng) * 1.09361).toFixed(2);
    console.log(distanceBetween);
    return distanceBetween;
  }

  function infoWindowCreator(yardsInBetween){
    var returnedInfoWindow = new google.maps.InfoWindow({
      content: yardsInBetween + ' yards',
      enabled: true
    });
  }

  function disMarkerMaker(obsPOS){{
    var newMarker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: obsPOS,
    });
    return newMarker
  }}

  function tisButaPOS(lat,lng){
    var returnedLatLng = new google.maps.LatLng(lat,lng);
    return returnedLatLng;
  }


  var options = {
    timeout: 10000,
    enableHighAccuracy: true
  };

  var currentHole = Chats.get($stateParams.chatId)
  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    var latLng = new google.maps.LatLng(currentHole.centerLat, currentHole.centerLng);
    var pinLatLng = new google.maps.LatLng(currentHole.pinLat, currentHole.pinLng);
    var currentPOS = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    $scope.yrdToHoleMap = (google.maps.geometry.spherical.computeDistanceBetween(currentPOS, pinLatLng) * 1.09361).toFixed(2);
    var yrdToHoleVariable = $scope.yrdToHoleMap;

    var mapOptions = {
      center: latLng,
      // disableDefaultUI:true, TODO: Unhighlight this
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
      var pinMarker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: pinLatLng,
      });
      var playerPOSMarker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: currentPOS,
      });
      var infoWindow = new google.maps.InfoWindow({
        content: yrdToHoleVariable + ' yards',
        enabled: true
      });
      var distanceLine = new google.maps.Polyline({
        path: [
          new google.maps.LatLng(currentHole.pinLat, currentHole.pinLng),
          new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        ],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      })

      distanceLine.setMap($scope.map);
      datEventListener(pinMarker,infoWindow);


      if(currentHole.id ===0){

        datEventListener(disMarkerMaker(tisButaPOS(currentHole.sTrapShrtLat,currentHole.sTrapShrtLng)),infoWindowCreator(demMarkersDistanceBetween(currentHole.sTrapShrtLat,currentHole.sTrapShrtLng,currentPOS)));
        // demMarkersDistanceBetween(currentHole.sTrapShrtLat,currentHole.sTrapShrtLng,currentPOS);
        // var sTrapShrtMarkPOS = new google.maps.LatLng(currentHole.sTrapShrtLat, currentHole.sTrapShrtLng);
        // var sTrapShrt = new google.maps.Marker({
        //   map: $scope.map,
        //   animation: google.maps.Animation.DROP,
        //   position: sTrapShrtMarkPOS,
        // });
        // var sTrapShrtInfo = new google.maps.InfoWindow({
        //   content:'',
        //   enabled: true
        // });
      }



    });
  }, function(error) {
    console.log("Could not get location");
  });
});
