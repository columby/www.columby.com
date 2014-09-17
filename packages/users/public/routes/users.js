'use strict';

angular.module('mean.users').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('signin', {
      url: '/u/signin',
      templateUrl: 'users/views/signin.html',
      authorization: {
        anonymousOnly: true
      }
    })


    // Edit user settings
    .state('settings', {
      url:'/u/settings',
      templateUrl: 'users/views/view.html',
      authorization: {
        authorizedRoles: ['authenticated'],
        permissions:[
          'can edit own account',
          'can edit accounts'
        ]
      }
    });
  }
]);
