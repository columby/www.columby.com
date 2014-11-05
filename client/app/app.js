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
  .run(function($rootScope, $http, AuthSrv){

    $rootScope.bodyClasses = {};

    // On initial run, check the user (with the JWT required from config)
    AuthSrv.me().then(function(response){
      $rootScope.user = {};
      if (response){
        $rootScope.user = response;
        $rootScope.selectedAccount = AuthSrv.selectedAccount();
      }
    });

    // Get environment vars from the server
    $http.post('/api/v2/user/config').success(function(data){
      if (data){
        $rootScope.config = data;
      }
    }).error(function(data) {
      console.log(data);
    });
  })

  .controller('ColumbyCtrl', function($rootScope, $location){
    $rootScope.$on('$stateChangeSuccess',  function(event, toState){
      // Add state to body class
      var stateName = toState.name;
      stateName = stateName.replace('.','-');
      $rootScope.bodyClasses.state = stateName;
      $rootScope.bodyClasses.embed = $location.search().embed;
    });
  })
;
