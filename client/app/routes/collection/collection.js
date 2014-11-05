'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('collection', {
        template: '<ui-view/>'
      })

      .state('collection.index', {
        url: '/c',
        templateUrl: 'app/routes/collection/partials/index.html',
        controller: 'CollectionIndexCtrl'
      })

      .state('collection.view', {
        url: '/c/:id',
        templateUrl: 'app/routes/collection/partials/view.html',
        controller: 'CollectionViewCtrl'
      })
      ;
  });
