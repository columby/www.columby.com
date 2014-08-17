'use strict';

angular.module('mean.datasets').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider

      .state('dataset view', {
        url: '/dataset/:datasetId',
        templateUrl: 'datasets/views/view.html',
      })

      .state('dataset create', {
        url: '/dataset/create',
        templateUrl: 'datasets/views/create.html',
        authorization: {
          authorizedRoles: ['authenticated']
        }
      })

      .state('dataset edit', {
        url: '/dataset/:datasetId/edit',
        templateUrl: 'datasets/views/edit.html',
        authorization: {
          authorizedRoles: ['authenticated']
        }
      })
    ;
  }
]);
