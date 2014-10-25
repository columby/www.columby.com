'use strict';

angular.module('columbyApp')

  .service('DatasetSrv', function ($resource) {

    return $resource('api/v2/dataset/:datasetId', {
      datasetId: '@datasetId'
    }, {
      update: {
        method: 'PUT',
      },
    }
    );

  })

  .service('DatasetDistributionSrv', function($resource) {

    return $resource('api/v2/dataset/:datasetId/distribution/:distributionId', {
      datasetId: '@datasetId',
      sourceId: '@distributionId',
    }, {
      update: {
        method: 'PUT',
      },
    }
    );
  })

  .service('DatasetReferencesSrv', function($resource) {

    return $resource('api/v2/dataset/:datasetId/reference/:referenceId', {
      datasetId: '@datasetId',
      sourceId: '@referenceId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  })
;
