'use strict';

angular.module('mean.users').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('profile', {
      url:'/:slug',
      templateUrl: 'users/views/profile.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    });
  }
]);
