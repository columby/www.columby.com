'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.collection').factory('CollectionSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/collection/:collectionId', {
      datasetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
]);
