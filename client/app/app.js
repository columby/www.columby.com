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

  .constant('configuration', {
    aws: {
      publicKey : 'AKIAIA6FZGJ3WN5NKSXA',
      bucket    : 'columby-dev',
      endpoint  : 's3.amazonaws.com/columby-dev'
    },
    embedly: {
      key       : '844b2c4d25334b4db2c327f10c70cb54'
    }
  })


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

  .run(function($rootScope, AuthSrv){
    // On initial run, check the user (with the JWT required from config)
    AuthSrv.me().then(function(response){
      $rootScope.user = {};
      if (response){
        $rootScope.user = response;
        $rootScope.selectedAccount = AuthSrv.selectedAccount();
      }
    });
  })
;
