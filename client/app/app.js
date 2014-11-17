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
  .run(function($rootScope, $http, AuthSrv){

    $rootScope.bodyClasses = {};
    $rootScope.user = {};

    // On initial run, check the user (with the JWT required from config).
    AuthSrv.setColumbyToken(angular.fromJson(localStorage.getItem('columby_token')));
    if (AuthSrv.columbyToken()) {
      // Fetch user information from server with JWT
      AuthSrv.me().then(function (response) {
        // remove local JWT when there was an error (expires or malformed).
        if (response.status === 'error') {
          localStorage.removeItem('columby_token');
          AuthSrv.setColumbyToken(null);
        }
        // Attached the user object to the rootscope.
        $rootScope.user = response.user;
        // Set the selected account if present, otherwise default to the first publication account.
        var a = response.selectedAccount || 0;
        AuthSrv.setSelectedAccount(a);
        $rootScope.selectedAccount = a;
      });
    }

    // Get environment vars from the server
    $http.post('/api/v2/user/config').success(function(data){
      if (data){
        $rootScope.config = data;
      }
    }).error(function(data) {
      console.log(data);
    });
  })

  .controller('ColumbyCtrl', function($window, $rootScope, $location, $anchorScroll){
    $rootScope.$on('$stateChangeSuccess',  function(event, toState){
      // send to analytics
      //$window.ga('send', 'pageview', { page: $location.path() });
      // Add state to body class
      var stateName = toState.name;
      stateName = stateName.replace('.','-');
      $rootScope.bodyClasses.state = stateName;
      $rootScope.bodyClasses.embed = $location.search().embed;

      $anchorScroll();

    });
  })
;
