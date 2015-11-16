(function() {
  'use strict';

  angular
    .module('ng-app')
    .config(function ($stateProvider) {
    $stateProvider

      .state('collections', {
        url: '/c',
        templateUrl: 'views/collection/index.html',
        controller: 'CollectionsCtrl'
      })

      .state('collection', {
        url: '/c/:id',
        templateUrl: 'views/collection/view.html',
        controller: 'CollectionCtrl'
      })

      .state('collectionEdit', {
        url: '/c/:id/edit',
        templateUrl: 'views/collection/edit.html',
        controller: 'CollectionEditCtrl'
      })
      ;
  });
})();
