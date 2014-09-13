'use strict';

angular.module('mean.account')

.config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('signin', {
      url: '/u/signin',
      templateUrl: 'account/views/signin.html',
      authorization: {
        anonymousOnly: true
      }
    })


    // Edit account settings
    .state('settings', {
      url:'/u/settings',
      templateUrl: 'account/views/account.html',
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
