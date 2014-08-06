'use strict';

angular.module('mean.columby').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('me', {
      url:'/me'
    })

    .state('publish', {
      url: '/publish',
      templateurl: 'columby/vieuws/publish.html',
      data: {
        authorizedRoles: ['authenticated']
      }
    })

    .state('signin', {
      url: '/signin',
      templateUrl: 'columby/views/signin.html'
    })
    
    .state('authenticate', {
      url: '/authenticate',
      templateUrl: 'columby/views/authenticate.html'
    })

    ;
  }
]);
