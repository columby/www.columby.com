'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('datasetCreate', {
        url: '/d/new',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        data: {
          bodyClasses: 'dataset create',
          permission: 'create dataset'
        }
      })

      .state('dataset', {
        url: '/d/:id',
        templateUrl: 'views/dataset/view.html',
        controller: 'DatasetViewCtrl',
        data: {
          bodyClasses: 'dataset view',
          permission: 'view dataset'
        }
      })

      .state('datasetEdit', {
        url: '/d/:id/edit',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        data: {
          bodyClasses: 'dataset edit',
          permission: 'edit dataset'
        }
      })
    ;
  });
