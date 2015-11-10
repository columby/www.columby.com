'use strict';

/***
 *
 * Load the app manually, first fetch user data asynchronically .
 *
 ***/
angular.element(document).ready(function() {

  //window.user = {};
  window.settings = window.settings || {};

  // var initInjector = angular.injector(['ng']);
  // var $http = initInjector.get('$http');
  // var token = localStorage.getItem('columby_token');
  //
  // if (token) {
  //   $http({
  //     method: 'POST',
  //     url: window.settings.apiRoot + '/v2/user/me',
  //     headers: { 'Authorization': 'Bearer ' + token }
  //   }).success(function(data) {
  //     // If response has no user object, delete the local token.
  //     if (data.id) {
  //       window.user = data;
  //     } else {
  //       localStorage.removeItem('columby_token');
  //     }
  //     // start the app
  //     angular.bootstrap(document, ['columbyApp']);
  //   }).error(function(data, status, headers, config){
  //     // there was an error fetching the user. load the app anyway and remove the token for security reasons
  //     localStorage.removeItem('columby_token');
  //     angular.bootstrap(document, ['columbyApp']);
  //   });
  // } else {
  //   // No token present, start the app.
  //   angular.bootstrap(document, ['columbyApp']);
  // }
  angular.bootstrap(document, ['columbyApp']);
});


angular.module('columbyApp', [
  'auth0',
  'angular-jwt',
  'angular-storage',
  'gettext',
  'ngAnimate',
  'ngFileUpload',
  'ngNotify',
  'ngProgress',
  'ngResource',
  'ngSanitize',
  'ngTagsInput',
  'ui.router',
  'ui.bootstrap',
  'satellizer',
  'slugifier',
  'td.easySocialShare',
  'textAngular'
]);
