'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'app/routes/home/home.html',
        controller: 'HomeCtrl'
      });
  });
