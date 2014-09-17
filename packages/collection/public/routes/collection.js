'use strict';

angular.module('mean.collection').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider

      .state('collection', {
        template: '<ui-view/>'
      })

      .state('collection.create', {
        url: '/:accountSlug/collection/new',
        templateUrl: 'collection/views/view.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        data: {
          editMode: true
        }
      })

      .state('collection.view', {
        url: '/:acountSlug/collection/:collectionId',
        templateUrl: 'collection/views/view.html',
      })

    ;
  }
]);
