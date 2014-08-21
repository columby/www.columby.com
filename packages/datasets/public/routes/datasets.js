'use strict';

angular.module('mean.datasets').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider

      .state('dataset create', {
        url: '/dataset/create',
        templateUrl: 'datasets/views/create.html',
        authorization: {
          authorizedRoles: ['authenticated']
        }
      })

      .state('dataset view', {
        url: '/dataset/:datasetId',
        templateUrl: 'datasets/views/view.html',
      })
    ;
  }
]);
