'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('dataset', {
        template: '<ui-view/>'
      })

      .state('dataset.create', {
        url: '/d/new',
        templateUrl: 'app/routes/dataset/partials/edit.html',
        authorization: { authorizedRoles: ['authenticated'] },
        controller: 'DatasetEditCtrl'
      })

      .state('dataset.view', {
        url: '/d/:id',
        templateUrl: 'app/routes/dataset/partials/view.html',
        controller: 'DatasetViewCtrl'
      })

      .state('dataset.edit', {
        url: '/d/:id/edit',
        templateUrl: 'app/routes/dataset/partials/edit.html',
        controller: 'DatasetEditCtrl',
        authorization: { authorizedRoles: ['authenticated'] },
      })
    ;
  });
