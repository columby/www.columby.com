'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.datasets').factory('DatasetSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/dataset/:datasetId', {
      datasetId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
]);
