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

.factory('DatasetDistributionSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/dataset/:datasetId/distribution/:distributionId', {
      datasetId: '@datasetId',
      sourceId: '@distributionId',
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
