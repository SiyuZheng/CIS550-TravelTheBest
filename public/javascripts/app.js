var app = angular.module('angularjsNodejsTutorial', []);

var markers = [];
var addMarker = function(pos) {
  var marker = new google.maps.Marker({
          position: pos,
          map: map,
  });
  markers.push(marker);
}

app.service('sharedService', function(){
  var categories = []; 
  this.add = function(incategories){
    categories = incategories;
  };
  this.get = function(){
    return categories;
  };     
});

app.controller('flightController', function($scope, $http, sharedService) {
  $scope.deleteAllMarkers = function() {
      for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
      markers = [];
  }
  $scope.findFlight = function() {
    var request = $http({
      url: '/findflight',
      method: "POST",
      data: {
        'depart': $scope.depart.toLowerCase(),
        'arrival': $scope.arrival.toLowerCase()
      }
    })

    request.success(function(response) {
      console.log(response.rows);
      $scope.flights = response.rows;
    });
    request.error(function(err) {
      console.log("error: ", err);
    });
    // console.log($scope.arrival)
  };

  $scope.searchdest = function() { 
  //   var request = $http({
  //     url: '/findbusiness',
  //     method: "POST",
  //     data: {
  //       'city': $scope.arrival.toLowerCase()
  //     }
  // })
    localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/destination";
    // sharedService.add($scope.arrival);

  // request.success(function(response) {
  //   // success
  //   if (response) {
  //     $scope.business = response;
  //     console.log(response);
  //     // window.location.href = "http://localhost:8081/destination";
  //   }
  // });
  // request.error(function(err) {
  //   // failed
  //   console.log("error: ", err);
  // });
  };
  
  $scope.findCityLatLng = function() {
    $scope.cities = [];
    var request1 = $http({
      url: '/findCityLatLng',
      method: "POST",
      data: {
        'city': $scope.depart.toLowerCase()
      }
    })
    request1.success(function(response) {
      var latlng1= {lat: response.rows[0][0], lng:response.rows[0][1]};
      $scope.cities.push(latlng1);
      var pos1 = {lat: parseFloat(latlng1.lat), lng : parseFloat(latlng1.lng)};
      addMarker(pos1);
      var request2 = $http({
        url: '/findCityLatLng',
        method: "POST",
        data: {
          'city': $scope.arrival.toLowerCase()
        }
      })
      request2.success(function(response) {
        var latlng2 = {lat: response.rows[0][0], lng:response.rows[0][1]};
        $scope.cities.push(latlng2);
        var pos2 = {lat: parseFloat(latlng2.lat), lng : parseFloat(latlng2.lng)}
        addMarker(latlng2);
        var lat_min = Math.min(pos1.lat, pos2.lat); 
        var lat_max = Math.max(pos1.lat, pos2.lat); 
        var lng_min = Math.min(pos1.lng, pos2.lng); 
        var lng_max = Math.max(pos1.lng, pos2.lng);
        map.setCenter(new google.maps.LatLng(
          ((lat_max + lat_min) / 2.0),
          ((lng_max + lng_min) / 2.0)
        )); 
        map.fitBounds(new google.maps.LatLngBounds(
        //bottom left
        new google.maps.LatLng(lat_min, lng_min),
        //top right
        new google.maps.LatLng(lat_max, lng_max)
        ));
      });
      request2.error(function(err) {
        console.log("error: ", err);
      });
    });
    request1.error(function(err) {
      console.log("error: ", err);
    });
  }
});


app.controller('destinationController', function($scope, $http, sharedService) {
  $scope.categories = [];
   $scope.getcategories = function(){
     $scope.categories = sharedService.get();
     var city = localStorage.getItem("city");
     console.log(city);
     sharedService.add(city);
   }

  $scope.passcategories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/destination/restaurants',
        method: "POST",
        data: {
          'destination': $scope.categories
        }
      })
      request1.success(function(response) {
        // success
        console.log(response);
        $scope.restaurants = response.rows;
      });
      request1.error(function(err) {
        // failed
        console.log("error: ", err);
      });
  }

    $scope.pass2categories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/destination/attractions',
        method: "POST",
        data: {
          'destination': $scope.categories
        }
      })
      request1.success(function(response) {
        // success
        console.log(response);
        $scope.attractions = response.rows;
      });
      request1.error(function(err) {
        // failed
        console.log("error: ", err);
      });
  }

  $scope.findhotels = function() { 
    // localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/hotels";
    // sharedService.add($scope.arrival);
  };

  $scope.findrestaurants = function() { 
    // localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/restaurants";
    // sharedService.add($scope.arrival);
  };

  $scope.findattractions = function() { 
    // localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/attractions";
    // sharedService.add($scope.arrival);
  };
});

app.controller('hotelsController', function($scope, $http) {

});

app.controller('restaurantsController', function($scope, $http, sharedService) {
  $scope.categories = [];
   $scope.getcategories = function(){
     // $scope.categories = sharedService.get();
     var city = localStorage.getItem("city");
     sharedService.add(city);
     // console.log(city) 
   }
  $scope.passcategories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/restaurants',
        method: "POST",
        data: {
          'destination': $scope.categories
        }
      })
      request1.success(function(response) {
        // success
        console.log(response);
        $scope.restaurants = response.rows;
      });
      request1.error(function(err) {
        // failed
        console.log("error: ", err);
      });
  }
});

app.controller('attractionsController', function($scope, $http) {
  
});

app.controller('loginController', function($scope, $http) {
  $scope.verifyLogin = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    var request = $http({
      url: '/login',
      method: "POST",
      data: {
        'username': $scope.username,
        'password': $scope.password
      }
    })

    request.success(function(response) {
      // success
      console.log(response);
      if (response.result === "success") {
        // After you've written the INSERT query in routes/index.js, uncomment the following line
        window.location.href = "http://localhost:8081/dashboard"
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });

  };
});

app.controller('userController', function($scope, $http) {
  var request = $http({
      url: '/user',
      method: "GET"
  })

  request.success(function(response) {
    // success
    if (response) {
      $scope.names = response;
      console.log(response);
    }
  });
  request.error(function(err) {
    // failed
    console.log("error: ", err);
  });
  $scope.getAllUser = function() {
    return $scope.names;
  }
});


// Template for adding a controller
/*
app.controller('dummyController', function($scope, $http) {
  // normal variables
  var dummyVar1 = 'abc';

  // Angular scope variables
  $scope.dummyVar2 = 'abc';

  // Angular function
  $scope.dummyFunction = function() {

  };
});
*/
