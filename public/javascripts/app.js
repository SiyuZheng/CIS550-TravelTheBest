var app = angular.module('angularjsNodejsTutorial', []);

var markers = [];
var addMarker = function(pos) {
  var marker = new google.maps.Marker({
          position: pos,
          map: map,
  });
  markers.push(marker);
}

var clearMarker = function() {
    for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
    markers = [];
}

var checkLessThanTen = function(num) {
  if (num.length < 2) {
    return "0" + num;
  }
  return num;
}


var centerInMap = function(address) {
  clearMarker();
  var geocoder = new google.maps.Geocoder();;
  geocoder.geocode({'address': address}, function(results, status) {
  if (status === 'OK') {
    map.setCenter(results[0].geometry.location);
    var marker = new google.maps.Marker({
      map: map,
      position: results[0].geometry.location
    });
    markers.push(marker);
    map.setZoom(15);
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
  });
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
    clearMarker();
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
      $scope.flights = response.rows;
    });
    request.error(function(err) {
      console.log("error: ", err);
    });
    // console.log($scope.arrival)
  };

  $scope.searchdest = function() { 
    localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/destination";
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

  $scope.pass3categories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/destination/hotels',
        method: "POST",
        data: {
          'destination': $scope.categories
        }
      })
      request1.success(function(response) {
        // success
        console.log(response);
        $scope.hotels = response.rows;
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

  $scope.getCityImages = function() {
    var city = localStorage.getItem("city");
    city = city.replace(/\s+/g, '-').toLowerCase();
    var request = $http({
      url: "https://api.teleport.org/api/urban_areas/slug:" + city + "/images/",
      method: "GET",
    })
    request.success(function(response) {
    // success
    if (response) {
        $scope.imgsrc = response.photos[0].image.web;     
    }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
  }
});

app.controller('hotelsController', function($scope, $http, sharedService) {
  $scope.locateMe = function(addr) {
    centerInMap(addr);
  }
  $scope.categories = [];
   $scope.getcategories = function(){
     var city = localStorage.getItem("city");
     sharedService.add(city);
   }
  $scope.passcategories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/hotels',
        method: "POST",
        data: {
          'destination': $scope.categories
        }
      })
      request1.success(function(response) {
        // success
        console.log(response);
        $scope.hotels = response.rows;
      });
      request1.error(function(err) {
        // failed
        console.log("error: ", err);
      });
  }
});

app.controller('restaurantsController', function($scope, $http, sharedService) {
  $scope.findTip = function(id) {
    console.log(id);
    $scope.id = id;
    var request = $http({
        url: '/tip',
        method: "POST",
        data: {
          'id': id
        }
      });
    request.success(function(response) {
        // success
        console.log(response);
        $scope.tips = response;
        console.log(response[0].text);
    });
    request.error(function(err) {
        // failed
        console.log("error: ", err);
    });
  }
  $scope.addTip = function(review) {
    var currentdate = new Date(); 
    var date = currentdate.getFullYear() + "-"
                + checkLessThanTen((currentdate.getMonth() + 1))  + "-" 
                + checkLessThanTen(currentdate.getDate()) + " "  
                + checkLessThanTen(currentdate.getHours()) + ":"  
                + checkLessThanTen(currentdate.getMinutes()) + ":" 
                + checkLessThanTen(currentdate.getSeconds());
    var request = $http({
        url: '/addtip',
        method: "POST",
        data: {
          'business_id': $scope.id,
          'text': review,
          'date': date
        }
      });
      request.success(function(response) {
        // success
        console.log("success");
      });
      request.error(function(err) {
          // failed
          console.log("error: ", err);
      });
      $scope.findTip($scope.id);
  }
  $scope.locateMe = function(addr) {
    centerInMap(addr);
  }
  $scope.categories = [];
   $scope.getcategories = function(){
     var city = localStorage.getItem("city");
     sharedService.add(city);
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

app.controller('attractionsController', function($scope, $http, sharedService) {
  $scope.locateMe = function(addr) {
    centerInMap(addr);
  }
  $scope.categories = [];
   $scope.getcategories = function(){
     var city = localStorage.getItem("city");
     sharedService.add(city);
   }
  $scope.passcategories = function(){
    $scope.categories = sharedService.get();
      var request1 = $http({
        url: '/attractions',
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
});


app.controller('recommendController', function($scope, $http) {
  $scope.cuisinerange = ['Thai','Japanese','American','Indian','Chinese','Italian','French','Spanish','Steak','Pizza','N/A'];
  $scope.attractionrange = ['Museum','Beach','Mountain','Ski','Park','Club','Music','N/A'];
  $scope.submit = function() {
    if ((($scope.cuisine == 'N/A' || $scope.cuisine == undefined) 
    && ($scope.place == 'N/A' || $scope.place == undefined) 
    && ($scope.country == 'N/A' || $scope.country == undefined)) ||
    (($scope.cuisine !== 'N/A' && $scope.cuisine !== undefined) 
    && ($scope.place == 'N/A' || $scope.place == undefined) 
    && ($scope.country == 'N/A' || $scope.country == undefined)) ||
     (($scope.cuisine == 'N/A' || $scope.cuisine == undefined) 
    && ($scope.place !== 'N/A' && $scope.place !== undefined) 
    && ($scope.country == 'N/A' || $scope.country == undefined)) ||
      (($scope.cuisine == 'N/A' || $scope.cuisine == undefined) 
    && ($scope.place == 'N/A' || $scope.place == undefined) 
    && ($scope.country !== 'N/A' && $scope.country !== undefined))){
      // console.log('select two')
      alert('Please make at least two selections');
    }
    else {
    var request = $http({
      url: '/recommend',
      method: "POST",
      data: {
        'cuisine': $scope.cuisine,
        'place': $scope.place,
        'country': $scope.country
      }
    })
    request.success(function(response) {
      // success
      console.log($scope.cuisine);
      console.log(response);
      $scope.recommend = response.rows;
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
    }
  };
});
