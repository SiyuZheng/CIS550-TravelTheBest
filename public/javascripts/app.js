var app = angular.module('angularjsNodejsTutorial', []);

// app.factory('sharedService', function(){
//   var categories = []; 
//   var addArgument = function(incategories){
//     categories.push(incategories);
//     // console.log(categories);
//   };
//   var getArgument = function(){
//     return categories;
//   }; 
//   return {
//     addArgument: addArgument,
//     getArgument: getArgument
//   };    
// });

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
  $scope.categories = [];
  $scope.findFlight = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    var request = $http({
      url: '/findflight',
      method: "POST",
      data: {
        'depart': $scope.depart.toLowerCase(),
        'arrival': $scope.arrival.toLowerCase()
      }
    })

    request.success(function(response) {
      // success
      // console.log(response.rows);
      $scope.flights = response.rows;
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });
    // console.log($scope.arrival)
  };

  $scope.searchdest = function() { 
    localStorage.setItem("city", $scope.arrival.toLowerCase());
    window.location.href = "/destination";
    // sharedService.add($scope.arrival);
  };

});


app.controller('destinationController', function($scope, $http, sharedService) {
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
