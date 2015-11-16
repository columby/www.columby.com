(function() {
  'use strict';

  angular
    .module('ng-app')  .config(function ($stateProvider) {

    $stateProvider
      .state('dataset', {
        abstract: true,
        url: '/d',
        template: '<ui-view/>'
      })

      .state('dataset.create', {
        url: '/create',
        templateUrl: 'views/dataset/create.html',
        controller: 'DatasetCreateCtrl',
        data: {
          bodyClasses: 'dataset create',
          permission: 'create dataset'
        }
      })

      .state('dataset.view', {
        url: '/:id',
        templateUrl: 'views/dataset/view.html',
        resolve: {
          // First try to fetch dataset.
          dataset: function(DatasetSrv, $stateParams) {
            return DatasetSrv.get({id: $stateParams.id}).$promise;
          }
        },
        controller: 'DatasetViewCtrl',
        data: {
          bodyClasses: 'dataset view'
        }
      })

      .state('dataset.edit', {
        url: '/:id/edit',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        resolve: {
          // First try to fetch dataset.
          dataset: function(DatasetSrv, $stateParams) {
            return DatasetSrv.get({id: $stateParams.id}).$promise;
          }
        },
        data: {
          bodyClasses: 'dataset edit',
          // Make sure the user can edit the dataset.
          //permission: 'edit dataset'
        }
      });
  });
})();
