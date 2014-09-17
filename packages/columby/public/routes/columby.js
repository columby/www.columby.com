'use strict';

angular.module('mean.columby').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('home', {
      url:'/',
      templateUrl: 'columby/views/home.html',
    })

    .state('terms', {
      url: '/terms',
      templateUrl: 'columby/views/terms.html',
    })

    .state('about', {
      url: '/about',
      templateUrl: 'columby/views/about.html',
    })

    .state('publish', {
      url: '/publish',
      templateUrl: 'columby/views/publish.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    })
    ;
  }
]);
