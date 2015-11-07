'use strict';

/**
 * @ngdoc overview
 * @name columbyworkerApp
 * @description
 * # columbyworkerApp
 *
 * Main module of the application.
 */
angular
  .module('columbyworkerApp', [
    'ngAnimate',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'angular-jwt'
  ])


  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true).hashPrefix('!');
  })

  // Set the JWT if it is stored
  .config(function($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function() {
      return angular.fromJson(localStorage.getItem('columby_token'));
    };
    $httpProvider.interceptors.push('jwtInterceptor');
  })

  // Run once during startup
  .run(function($log, $rootScope, $http, AuthSrv, configSrv){

    $rootScope.user = {};
    $rootScope.config = configSrv;

    if (localStorage.getItem('columby_token')) {
      AuthSrv.me().then(function (response) {
        console.log(response);
        if (response.status === 'error') {
          localStorage.removeItem('columby_token');

        }
        if (response.id) {
          $rootScope.user = response;
        }
      });
    }
  })

  .controller('AppController', function(){

  });
