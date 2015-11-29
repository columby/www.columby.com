'use strict';

angular.module('columbyworkerApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainController'
      })

      .state('job', {
        url: '/job/:id',
        templateUrl: 'views/jobs/show.html',
        controller: 'JobCtrl'
      })

      ;
  });
