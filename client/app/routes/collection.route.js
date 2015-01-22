'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('collection', {
        template: '<ui-view/>'
      })

      .state('collection.index', {
        url: '/c',
        templateUrl: 'views/collection/index.html',
        controller: 'CollectionIndexCtrl'
      })

      .state('collection.view', {
        url: '/c/:id',
        templateUrl: 'views/collection/view.html',
        controller: 'CollectionViewCtrl'
      })

      .state('collection.edit', {
        url: '/c/:id/edit',
        templateUrl: 'views/collection/edit.html',
        controller: 'CollectionEditCtrl'
      })
      ;
  });
