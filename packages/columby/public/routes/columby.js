'use strict';

angular.module('mean.columby').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('me', {
      url:'/me',
      templateurl: 'columby/views/account.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    })

    .state('publish', {
      url: '/publish',
      templateurl: 'columby/views/publish.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    })

    .state('signin', {
      url: '/signin',
      templateUrl: 'columby/views/signin.html',
      authorization: {
        anonymousOnly: true
      }

    })
    ;
  }
]);
