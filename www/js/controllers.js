angular.module('starter.controllers', [])
  .controller('AppCtrl', function ($http, $scope, $log, User) {


    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.currentUser = User.loggedIn();
  })

  .controller('LoginCtrl', function ($scope, $http, $log, $state, $cordovaFacebook, User) {
    if (User.loggedIn() == true) return $state.go('app.profile');
    $scope.loginData = {};

    $scope.FBLogin = function() {
      $cordovaFacebook.login(["public_profile", "email"]).then(function (success) {
        $http.post(AppSettings.baseApiUrl + '/v1/facebook', {
          user: { auth_token: success.authResponse.accessToken}
        }).then(function (response) {
          window.localStorage['authToken'] = response.data.access_token;
          window.localStorage['userId'] = response.data.id;
          // @TODO: persist user somehow
          User.setUser(response.data);
          $scope.currentUser = true;
          return $state.go('app.profile');
        }, function (error) {
          alert('Incorrect password - please try again.')
          $log.log(error);
        });

      }, function (error) {
        console.log(error);
      });
    };

    $scope.doLogin = function () {
      $http.post(AppSettings.baseApiUrl + '/v1/login', {
        email: $scope.loginData.username,
        password: $scope.loginData.password
      }).then(function (response) {
        window.localStorage['authToken'] = response.data.access_token;
        window.localStorage['userId'] = response.data.id;
        // @TODO: persist user somehow
        User.setUser(response.data);
        $scope.currentUser = true;
        return $state.go('app.profile');
      }, function (error) {
        alert('Incorrect password - please try again.')
        $log.log(error);
      });
    };
  })

  .controller('SignupCtrl', function ($scope, $http, $log, $state, $cordovaFacebook, User) {
    if (User.loggedIn() == true) return $state.go('app.profile');

    $scope.FBLogin = function() {
      $cordovaFacebook.login(["public_profile", "email"]).then(function (success) {
        $http.post(AppSettings.baseApiUrl + '/v1/facebook', {
          user: { auth_token: success.authResponse.accessToken}
        }).then(function (response) {
          window.localStorage['authToken'] = response.data.access_token;
          window.localStorage['userId'] = response.data.id;
          // @TODO: persist user somehow
          User.setUser(response.data);
          $scope.currentUser = true;
          return $state.go('app.profile');
        }, function (error) {
          alert('Incorrect password - please try again.')
          $log.log(error);
        });

      }, function (error) {
        console.log(error);
      });
    };

    $scope.signupData = {};
    $scope.doSignup = function () {
      $http.post(AppSettings.baseApiUrl + '/v1/user', {
        user: {
          email: $scope.signupData.email,
          password: $scope.signupData.password,
          password_confirmation: $scope.signupData.password_confirmation
        }
      }).then(function (response) {
        window.localStorage['authToken'] = response.data.access_token;
        window.localStorage['userId'] = response.data.id;
        // @TODO: persist user somehow
        User.setUser(response.data);
        return $state.go('app.profile');
      }, function (error) {
        alert('Incorrect password - please try again.')
        $log.log(error);
      });
    };
  })

  .controller('SalesCtrl', function ($scope, Sales, Regions) {
    $scope.regions = Regions.query();
    $scope.sales = Sales.query();
    $scope.futureButton = true;
  })

  .controller('FutureSalesCtrl', function ($scope, Sales, Regions) {
    $scope.regions = Regions.query();
    $scope.sales = Sales.query({future: true})
  })

  .controller('SaleCtrl', function ($scope, $stateParams, $state, $http, Sales, User) {
    $scope.sale = Sales.get({id: $stateParams.saleId});
    if (User.loggedIn() === true) {
      $http.post(AppSettings.baseApiUrl + '/v1/me/can', {
        sale_id: $stateParams.saleId
      }).then(function (response) {
        $scope.canEdit = response.data;
      }, function (error) {
        // Errored, defaulting to can't edit.
        $scope.canEdit = false;
      })
      $scope.updateSale = function () {
        $scope.sale.$update(function () {

        })
      }
      $scope.deleteSale = function () {
        $scope.sale.$delete(function () {
          $state.go('app.profile');
        })
      }
    }
  })

  .controller('ProfileEditCtrl', function ($scope, $stateParams, $state, User, Regions, Cities, Profile) {
    if (User.loggedIn() == false) return $state.go('app.login');
    $scope.profile = new Profile()
    $scope.regions = Regions.query();
    $scope.settlements = Cities.list();

    $scope.submitProfile = function (form) {
      if (form.$valid) {
        $scope.profile.$save(function () {
          $state.go('app.profile');
        })
      } else {
        alert('Missing data....')
      }
    }
  })

  .controller('EditProfileCtrl', function ($scope, $stateParams, $state, User, Regions, Cities, Profile) {
    if (User.loggedIn() == false) return $state.go('app.login');
    User.me().success(function (response) {
      $scope.user = response;
      $scope.profile = new Profile($scope.user.profile);
      if ($scope.profile == null) {
        return $state.go('app.profileEdit');
      }
    });
    $scope.regions = Regions.query();
    $scope.settlements = Cities.list();


    $scope.submitProfile = function (form) {
      if (form.$valid) {
        $scope.profile.$update(function () {
          $state.go('app.profile');
        })
      } else {
        alert('Missing data....')
      }
    }
  })

  .controller('ProfileCtrl', function ($scope, $stateParams, $state, User, Sales) {
    if (User.loggedIn() == false) return $state.go('app.login');
    User.me().success(function (response) {
      $scope.user = response;
      $scope.profile = $scope.user.profile;
      if ($scope.profile == null) {
        return $state.go('app.profileEdit');
      }
    });
    $scope.sales = Sales.query({id: 'me'});
    $scope.newSale = function () {
      return $state.go('app.newSale')
    }
  })

  .controller('newSaleCtrl', function ($scope, $stateParams, $state, $http, User, Sales) {
    if (User.loggedIn() == false) return $state.go('app.login');
    $http.get(AppSettings.baseApiUrl + '/v1/vegs').success(function (response) {
      $scope.vegs = response;
    });
    $scope.selected_vegs = [];
    $scope.toggleSelection = function toggleSelection(fruitName) {
      var idx = $scope.selected_vegs.indexOf(fruitName);
      if (idx > -1) {
        $scope.selected_vegs.splice(idx, 1);
      } else {
        $scope.selected_vegs.push(fruitName);
      }
    };
    $scope.sale = new Sales();
    $scope.saveSale = function () {
      $scope.sale.veg_list = $scope.selected_vegs;
      if ($scope.sale.new_veg) $scope.sale.veg_list.push($scope.sale.new_veg)
      $scope.sale.$save(function () {
        $state.go('app.profile');
      })
    }
  })

  .controller('mapCtrl', function($scope, $timeout, $cordovaGeolocation, uiGmapGoogleMapApi, Sales) {
    $scope.markers = [];
    $scope.infoVisible = false;
    $scope.infoBusiness = {};

    // Initialize and show infoWindow for business
    $scope.showInfo = function(marker, eventName, markerModel) {
      $scope.infoBusiness = markerModel;
      $scope.infoVisible = true;
    };

    // Hide infoWindow when 'x' is clicked
    $scope.hideInfo = function() {
      $scope.infoVisible = false;
    };

    var initializeMap = function(position) {
      if (!position) {
        // Default to downtown Toronto
        position = {
          coords: {
            latitude: 43.6722780,
            longitude: -79.3745125
          }
        };
      }

      console.log(position);
      // TODO add marker on current location

      $scope.map = {
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        zoom: 8,
        bounds: {}
      };

      // Make info window for marker show up above marker
      $scope.windowOptions = {
        pixelOffset: {
          height: -32,
          width: 0
        }
      };

      $scope.options = {
        scrollwheel: false
      };
      $scope.bd = {
        northeast: {
          latitude: 51.219053,
          longitude: 4.404418
        },
        southwest: {
          latitude: -51.219053,
          longitude: -4.404418
        }
      }


      //Sales.query().then(function(data) {
      //  console.log(data);
      //  //for (var i = 0; i < 10; i++) {
      //  //  var business = data.data.businesses[i];
      //  //  $scope.markers.push({
      //  //    id: i,
      //  //    name: business.name,
      //  //    url: business.url,
      //  //    location: {
      //  //      latitude: business.location.coordinate.latitude,
      //  //      longitude: business.location.coordinate.longitude
      //  //    }
      //  //  });
      //  //}
      //}, function(error) {
      //  console.log("Unable to access yelp");
      //  console.log(error);
      //});
    };

    uiGmapGoogleMapApi.then(function(maps) {
      // Don't pass timeout parameter here; that is handled by setTimeout below
      var posOptions = {enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        initializeMap(position);
      }, function(error) {
        console.log(error);
        initializeMap();
      });
    });

    // Deal with case where user does not make a selection
    $timeout(function() {
      if (!$scope.map) {
        console.log("No confirmation from user, using fallback");
        initializeMap();
      }
    }, 5000);
  })
