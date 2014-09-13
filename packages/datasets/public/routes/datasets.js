'use strict';

angular.module('mean.datasets').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider

      .state('dataset', {
        template: '<ui-view/>'
      })

      .state('dataset.create', {
        url: '/dataset/new',
        templateUrl: 'datasets/views/view.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        data: {
          editMode: true
        }
      })

      .state('dataset.view', {
        url: '/dataset/:datasetId',
        templateUrl: 'datasets/views/view.html',
      })

    ;
  }
]);
