'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'views/home/home.html',
        controller: 'HomeCtrl',
        data: {
          bodyClasses: 'home'
        }
      });
  });
