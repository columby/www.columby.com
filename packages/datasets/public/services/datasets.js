'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.datasets')

.factory('DatasetSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/dataset/:datasetId', {
      datasetId: '@datasetId'
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
])

.factory('DatasetSourcesSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/dataset/:datasetId/source/:sourceId', {
      datasetId: '@datasetId',
      sourceId: '@sourceId',
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
])

.factory('DatasetReferencesSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/dataset/:datasetId/reference/:referenceId', {
      datasetId: '@datasetId',
      sourceId: '@referenceId',
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
])

;
