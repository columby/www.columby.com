'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('search', {
        url: '/search',
        templateUrl: 'app/routes/search/search.html',
        controller: 'SearchCtrl'
      });
  });