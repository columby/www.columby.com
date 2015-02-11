'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('datasetCreate', {
        url: '/d/new',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl'
      })

      .state('dataset', {
        url: '/d/:id',
        templateUrl: 'views/dataset/view.html',
        controller: 'DatasetViewCtrl'
      })

      .state('datasetEdit', {
        url: '/d/:id/edit',
        templateUrl: 'views/dataset/edit.html',
        controller: 'DatasetEditCtrl'
      })
    ;
  });
