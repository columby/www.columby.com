'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('search', {
        url: '/search',
        templateUrl: 'app/routes/search/partials/search.html',
        controller: 'SearchCtrl'
      });
  });
