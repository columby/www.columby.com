'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('dataset', {
        template: '<ui-view/>'
      })

      .state('dataset.create', {
        url: '/d/new',
        templateUrl: 'app/routes/dataset/views/dataset.html',
        authorization: { authorizedRoles: ['authenticated'] },
        data: { editMode: true},
        controller: 'DatasetCtrl'
      })

      .state('dataset.view', {
        url: '/d/:id',
        templateUrl: 'app/routes/dataset/views/dataset.html',
        controller: 'DatasetCtrl'
      })

      .state('dataset.edit', {
        url: '/d/:id/edit',
        templateUrl: 'app/routes/dataset/views/dataset.html',
        controller: 'DatasetCtrl',
        authorization: { authorizedRoles: ['authenticated'] },
        data: { editMode: true }
      })
    ;
  });
