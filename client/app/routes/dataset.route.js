'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('dataset', {
        abstract: true,
        url: '/d',
        template: '<ui-view/>'
      })
      
      .state('dataset.create', {
        url: '/new',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        data: {
          bodyClasses: 'dataset create',
          permission: 'create dataset'
        }
      })

      .state('dataset.view', {
        url: '/:id',
        templateUrl: 'views/dataset/view.html',
        controller: 'DatasetViewCtrl',
        data: {
          bodyClasses: 'dataset view',
          permission: 'view dataset'
        }
      })

      .state('dataset.edit', {
        url: '/:id/edit',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl',
        data: {
          bodyClasses: 'dataset edit',
          permission: 'edit dataset'
        }
      });
  });
