'use strict';

angular.module('columbyApp')

.controller('AppCtrl', function($window, $rootScope, $location, configSrv){

  //IE console
  window.console = window.console || {};
  window.console.log = window.console.log || function() {};

  // Set page title
  $rootScope.title = "Columby";

  // Set user if available
  $rootScope.user = window.user || {};
  delete window.user;

  // Set configuration
  $rootScope.config = configSrv;

  // Change body class after state change
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (toState.data && toState.data.bodyClasses) {
      $rootScope.bodyClasses = toState.data.bodyClasses;
      return;
    }
    $rootScope.bodyClasses = 'default';
  });

})
