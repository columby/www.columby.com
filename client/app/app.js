'use strict';

/***
 *
 * Load the app manually, first fetch user data asynchronically .
 *
 ***/
angular.element(document).ready(

  function() {

    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var token = localStorage.getItem('columby_token');

    if (token) {
      $http({
        method: 'POST',
        url: 'https://dev-api.columby.com/v2/user/me',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).then(function(response) {
        // If response has no user object, delete the local token.
        if (!response.data.id) {
          localStorage.removeItem('columby_token');
        } else {
          window.user = response.data;
        }
        // start the app
        angular.bootstrap(document, ['columbyApp']);
      });
    } else {
      // No token present, start the app.
      angular.bootstrap(document, ['columbyApp']);
    }
  }
);



/***
 *
 * Main module of the application.
 *
 ***/
angular.module('columbyApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'angular-jwt',
  'satellizer',
  'slugifier',
  'ngDialog',
  'angularFileUpload',
  'textAngular',
  'td.easySocialShare',
  'ngProgress',
  'ngTagsInput',
  'ngNotify',
])



/***
 *
 * Use the HTML5 History API
 * For any unmatched url, redirect to /
 *
 ***/
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true).hashPrefix('!');
})



/***
 *
 * Authentication configuration.
 *   Satellizer settings
 *
 ***/
.config(function($authProvider) {

  // Setup token name
  $authProvider.tokenName = 'token';
  $authProvider.tokenPrefix = 'columby';
})



/***
 *
 * Check permission for each state change
 *
 ***/
.run(function($rootScope, AccountSrv, $state, ngNotify) {

  ngNotify.config({
    theme: 'pure',
    position: 'top',
    duration: 5000,
    type: 'info',
    sticky: false
  });

  // Check each state change start
  $rootScope.$on('$stateChangeStart', function (event, next) {
    // Check for required authorized role
    if (next.data && next.data.authorizedRoles) {
      var authorizedRoles = next.data.authorizedRoles;
      // Return ro home if user does not have required role.
      if (!AccountSrv.isAuthorized(authorizedRoles)){
        event.preventDefault();
        $state.go('home');
        ngNotify.set('Geen toegang.', 'error');
      }
    }
  });
});
