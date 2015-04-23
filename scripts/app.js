'use strict'

// Application main file that includes application configurations
// In real application, these should be broken down into individual Javascript files
angular.module('weatherApp', ['ngRoute'])

  // Location class - singleton
  .service('Location', function($http, $q) {
    var Location = this;

    // Get the user current location
    Location.getUserLocationZip = function() {
      var defer = $q.defer();
      $http.get('https://freegeoip.net/json').then(
        function (resp) {
          defer.resolve(resp.data.zip_code);
        },
        function (resp) {
          // Use San Francisco as default fallback location
          console.log('[Error]: Failed to get user location.  Faillback to San Francisco');
          defer.resolve(94112);
        }
      )
      return defer.promise;
    };

    return Location;
  })

  // Weather class - singleton
  .service('Weather', function(Location, $http, $q) {
    var Weather = this;

    Weather.getWeatherData = function(zipcode) {
      var defer = $q.defer();
      $http.get('http://api.openweathermap.org/data/2.5/weather?units=metric&zip=' + zipcode + ',us').then(
        function (resp) {
          defer.resolve(resp.data);
        },
        function (resp) {
          console.log('[Error]: Failed to get weather information');
          defer.resolve(null);
        }
      )
      return defer.promise;
    };

    return Weather;
  })

  // Controller for weather display
  .controller('WeatherController', function($q, $location, $scope, $routeParams, Location, Weather) {

    // Get the zip code from either the URL param or the
    var locationDefer = $q.defer()
    if (!$routeParams.zipcode) {
      Location.getUserLocationZip().then(function(zipcode){
        locationDefer.resolve(zipcode)
      })
    } else{
      locationDefer.resolve($routeParams.zipcode)
    }

    // Get the weather information based on the zip code
    locationDefer.promise.then(function(zipcode){
      Weather.getWeatherData(zipcode).then(function(weatherInfo){
        $scope.city = weatherInfo.name
        $scope.temperatue = weatherInfo.main.temp
      });
    });

    // Handle form submission
    $scope.zipEntered = function(){
      $location.path('/zip/' + $scope.zip);
    };

  })

  // Config the routing for the app
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'WeatherController',
        templateUrl: 'weather.html'
      })
      .when('/zip/:zipcode', {
        controller: 'WeatherController',
        templateUrl: 'weather.html'
      })
  });
