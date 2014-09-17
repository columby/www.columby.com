'use strict';

angular.module('mean.collection').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider

      .state('collection', {
        template: '<ui-view/>'
      })

      .state('collection.create', {
        url: '/new/c?accountId',
        templateUrl: 'collection/views/view.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        data: {
          editMode: true
        }
      })

      .state('collection.view', {
        url: '/c/:collectionId',
        templateUrl: 'collection/views/view.html',
      })

    ;
  }
]);
