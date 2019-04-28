var app = angular.module('angularjsNodejsTutorial', []);

var markers = [];
var addMarker = function(pos) {
  var marker = new google.maps.Marker({
          position: pos,
          map: map,
  });
  markers.push(marker);
}

app.controller('flightController', function($scope, $http) {
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
        var lng_max = Math.min(pos1.lng, pos2.lng);
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

app.controller('genreController', function($scope, $http) {
  var request = $http({
      url: '/genre',
      method: "GET"
  })

  request.success(function(response) {
    // success
    if (response) {
      $scope.names = response;
    }
  });
  request.error(function(err) {
    // failed
    console.log("error: ", err);
  });
  $scope.getAllGenre = function() {
    return $scope.names;
  }
  $scope.getTop10 = function(genre) {
    var getTop10Request = $http({
      url: '/genre/' + genre,
      method: "GET"
    })
    getTop10Request.success(function(response) {
    // success
    if (response) {
        $scope.movies = response;
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
  }
});

app.controller('recommendationsController', function($scope, $http) {
  var rec = [];
  var genres = [];
  var ind = 0;
  var count = 0;
  $scope.getRecommendations = function() {
    ind = 0;
    count = 0;
    genres = [];
    rec = [];
    var request = $http({
      url: '/recommendation',
      method: "POST",
      data: {
        'id': $scope.id
      }
    })
  request.success(function(response) {
    // success
    if (response) {
      genres = response;
      var count = 0;
      while (count < response.length * 10) {
        var m = $scope.getRandomMovieFromGenre(genres[ind].genre);
        ind = (ind + 1) % genres.length;
        count++;
      }
      $scope.names = rec;
    }
  });
  request.error(function(err) {
    // failed
    console.log("error: ", err);
  });
  return $scope.names;
  }
  $scope.getRandomMovieFromGenre = function(genre) {
    var request = $http({
      url: '/recMovie',
      method: "POST",
      data: {
        'id': $scope.id,
        'genre': genre
      }
    });
    request.success(function(response) {
      // success
      if (rec.length < 10) {
        var dup = false;
        for (var i = 0; i < rec.length; i++) {
          if (rec[i].title == response[0].title) {
            dup = true;
          }
        }
        if (!dup) {
          rec.push(response[0]);
        } 
      }
    });
    request.error(function(err) {
    // failed
    console.log("error: ", err);
    });
  }
});

app.controller('bestofController', function($scope, $http) {
  var range = [];
  for (var i = 2000; i <= 2017; i++) {
       range.push(i);
  }
  $scope.years = range;
  $scope.getBestOf = function() {
    var request = $http({
      url: '/bestofmovie',
      method: "POST",
      data: {
        'year': $scope.movieYear
      }
    })
    request.success(function(response) {
      // success
      if (response) {
        $scope.movies = response;
        console.log(response);
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
    return $scope.movies;
  }
});

app.controller('postersController', function($scope, $http) {
  var imdbs = [];
  var movies = [];

  var request = $http({
      url: '/imdbid',
      method: "GET"
  })
  request.success(function(response) {
      $scope.getPosterAndName = function(id) {
    var request = $http({
      url: "http://www.omdbapi.com/?apikey=33aa2b0e&i=" + id,
      method: "GET",
    })
    request.success(function(response) {
    // success
    if (response) {
        movies.push(response);
        // console.log("inside response", movies);
        
        if (movies.length == 10) {
          $scope.posters = movies;
          console.log($scope.posters);
        }
        
    }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
  }
    // success
    if (response) {
      imdbs = response;
      for (var i = 0; i < imdbs.length; i++) {
        $scope.getPosterAndName(imdbs[i].imdb_id);
      }
      
      // console.log('movies', movies);
    }
  });
  request.error(function(err) {
    // failed
    console.log("error: ", err);
  });





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
