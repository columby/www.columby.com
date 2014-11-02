'use strict';

angular.module('columbyApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'angular-jwt',
  'toaster',
  'slugifier',
  'ngDialog',
  'angularFileUpload',
  'textAngular',
  'td.easySocialShare'
])

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  })


  // Set the JWT if it is stored
  .config(function($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function() {
      return angular.fromJson(localStorage.getItem('columby_token'));
    };
    $httpProvider.interceptors.push('jwtInterceptor');
  })


  // Run once during startup
  .run(function($rootScope, AuthSrv){
    // On initial run, check the user (with the JWT required from config)
    AuthSrv.me().then(function(response){

      $rootScope.user = {};
      if (response){
        $rootScope.user = response;
        $rootScope.selectedAccount = AuthSrv.selectedAccount();
      }
    });

    // Get environment vars from the server
    AuthSrv.getConfig().then(function(response){
      console.log(response);
      if (response){
        $rootScope.config = response;
      }
    });
  })
;
