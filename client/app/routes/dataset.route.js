'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('dataset', {
        template: '<ui-view/>'
      })

      .state('dataset.create', {
        url: '/d/new',
        templateUrl: '/views/dataset/edit.html',
        authorization: { authorizedRoles: ['authenticated'] },
        controller: 'DatasetEditCtrl'
      })

      .state('dataset.view', {
        url: '/d/:id',
        templateUrl: '/views/dataset/view.html',
        controller: 'DatasetViewCtrl'
      })

      .state('dataset.edit', {
        url: '/d/:id/edit',
        templateUrl: '/views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        authorization: { authorizedRoles: ['authenticated'] },
      })
    ;
  });
