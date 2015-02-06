'use strict';

angular.module('columbyApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'angular-jwt',
  'toaster',
  'slugifier',
  'ngDialog',
  'angularFileUpload',
  'textAngular',
  'td.easySocialShare',
  'ngProgress',
  'ngTagsInput'
])

  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider
      .otherwise('/');

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
    //IE console
    window.console = window.console || {};
    window.console.log = window.console.log || function() {};

    $rootScope.bodyClasses = {};
    $rootScope.user = {};
    $rootScope.config = configSrv;

    // On initial run, check the user (with the JWT required from config).
    if (localStorage.getItem('columby_token')) {
      // Fetch user information from server with JWT
      AuthSrv.me().then(function (response) {
        // remove local JWT when there was an error (expires or malformed).
        //console.log(response);
        if (response.status === 'error') {
          localStorage.removeItem('columby_token');
        }
        // Attached the user object to the rootscope.
        if (response.id) {
          // set primary account
          $rootScope.user = response;
        }
      });
    }
  })

  .controller('ColumbyCtrl', function($window, $rootScope, $location){
    $rootScope.$on('$stateChangeSuccess',  function(event, toState){

      // send to analytics
      //$window.ga('send', 'pageview', { page: $location.path() });
      // Add state to body class
      var stateName = toState.name;
      stateName = stateName.replace('.','-');
      $rootScope.bodyClasses.state = stateName;
      $rootScope.bodyClasses.embed = $location.search().embed;

    });
  })
;
