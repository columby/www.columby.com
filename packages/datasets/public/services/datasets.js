'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.datasets')

.factory('DatasetSrv', ['$resource', 'AuthSrv',

  function($resource, AuthSrv) {

    return $resource('api/v2/dataset/:datasetId', {
      datasetId: '@datasetId'
    }, {
      update: {
        method: 'PUT',
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      get: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      save: {
        method: 'POST',
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
    }
    );
  }
])

.factory('DatasetDistributionSrv', ['$resource', 'AuthSrv',

  function($resource, AuthSrv) {

    return $resource('api/v2/dataset/:datasetId/distribution/:distributionId', {
      datasetId: '@datasetId',
      sourceId: '@distributionId',
    }, {
      update: {
        method: 'PUT',
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      get: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      save: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
    }
    );
  }
])

.factory('DatasetReferencesSrv', ['$resource', 'AuthSrv',

  function($resource, AuthSrv) {

    return $resource('api/v2/dataset/:datasetId/reference/:referenceId', {
      datasetId: '@datasetId',
      sourceId: '@referenceId',
    }, {
      update: {
        method: 'PUT',
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      get: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      },
      save: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT
        }
      }
    }
    );
  }
])

;
