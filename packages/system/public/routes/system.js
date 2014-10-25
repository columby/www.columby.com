'use strict';

//Setting up route
angular.module('mean.system')

.config(['$locationProvider','$urlRouterProvider',
  function($locationProvider,$urlRouterProvider) {

    $locationProvider
      //.html5Mode(true)
      .hashPrefix('!');

    $urlRouterProvider.otherwise('/');
  }
])

;
