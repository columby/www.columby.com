'use strict';

/***
 *
 * Load the app manually, first fetch user data asynchronically .
 *
 ***/
angular.element(document).ready(function() {

  window.user = {};

  var initInjector = angular.injector(['ng']);
  var $http = initInjector.get('$http');
  var token = localStorage.getItem('columby_token');

  if (token) {
    $http({
      method: 'GET',
      url: 'https://columby.nl/api/user/me',
      headers: { 'Authorization': 'Bearer ' + token }
    }).success(function(data) {
      // If response has no user object, delete the local token.
      if (!data.user.id) {
        localStorage.removeItem('columby_token');
      } else {
        window.user = data.user;
      }
      // start the app
      angular.bootstrap(document, ['columbyApp']);
    }).error(function(data, status, headers, config){
      // there was an error fetching the user. load the app anyway and remove the token for security reasons
      localStorage.removeItem('columby_token');
      angular.bootstrap(document, ['columbyApp']);
    });
  } else {
    // No token present, start the app.
    angular.bootstrap(document, ['columbyApp']);
  }
});


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
]);
