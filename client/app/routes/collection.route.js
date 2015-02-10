'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('collections', {
        url: '/c',
        templateUrl: 'views/collection/index.html',
        controller: 'CollectionIndexCtrl'
      })

      .state('collection', {
        url: '/c/:id',
        templateUrl: 'views/collection/view.html',
        controller: 'CollectionViewCtrl'
      })

      .state('collectionEdit', {
        url: '/c/:id/edit',
        templateUrl: 'views/collection/edit.html',
        controller: 'CollectionEditCtrl'
      })
      ;
  });
