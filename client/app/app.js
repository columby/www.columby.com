'use strict';

/***
 *
 * Load the app manually, first fetch user data synchronically.
 * Config is loaded directly in index.html by loading a local config.js file
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
        url: window.config.apiRoot + '/v2/user/me',
        headers: { 'Authorization': 'Bearer ' + token }
      }).success(function(data, status, headers, config) {
        // If response has no user object, delete the local token.
        if (!data.id) {
          console.log('Removing local token. Response: ', data);
          localStorage.removeItem('columby_token');
        } else {
          window.user = data;
        }
        // start the app
        angular.bootstrap(document, ['columbyApp']);
      }).error(function(data, status, headers, config){
        console.log(data);
        // there was an error fetching the user. load the app anyway and remove the token for security reasons
        localStorage.removeItem('columby_token');
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
  'ngResource',
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'angular-jwt',
  'satellizer',
  'slugifier',
  'ngFileUpload',
  'textAngular',
  'td.easySocialShare',
  'ngProgress',
  'ngTagsInput',
  'ngNotify',
  'gettext'
])



/***
 *
 * Use the HTML5 History API
 * For any unmatched url, redirect to /
 *
 ***/
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');
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
  $authProvider.withCredentials = false;
  // Setup Google authentication provider
  $authProvider.google({
    url               : window.config.apiRoot+'/v2/auth/google',
    clientId          : '313936519511-lklf0npbiafkj3iregop6cle0n8hrpd9.apps.googleusercontent.com',
    scope             : ['profile', 'email'],
    redirectUri       : window.location.origin || window.location.protocol + '//' + window.location.host,
    requiredUrlParams : ['scope'],
    optionalUrlParams : ['display']
  });

})


.run(function(gettextCatalog) {
  gettextCatalog.setCurrentLanguage('nl_NL');
})


.run(function(ngNotify) {
  ngNotify.config({
    theme: 'pure',
    position: 'top',
    duration: 5000,
    type: 'info',
    sticky: false
  });
})

/***
 *
 * Check permission for each state change
 *
 ***/
.run(function($rootScope, AuthSrv, $state, ngNotify, $location) {

  var path = $location.path();

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    //Check if the user has the required role
    if (toState.data && toState.data.permission) {
      if (!AuthSrv.hasPermission(toState.data.permission, toParams)){
        event.preventDefault();
        $state.go('home');
        ngNotify.set('Sorry, you have no access to the requested page.', 'error');
      }
    }
  });
});
