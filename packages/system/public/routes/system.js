'use strict';

//Setting up route
angular.module('mean.system')

.config(['$locationProvider', '$stateProvider', '$urlRouterProvider',
  function($locationProvider, $stateProvider, $urlRouterProvider) {

    $locationProvider.hashPrefix('!');

    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    // states for my app
    /*
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'system/views/index.html'
      });
    */
  }
])

;
