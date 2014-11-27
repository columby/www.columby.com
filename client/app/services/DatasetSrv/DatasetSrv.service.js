'use strict';

angular.module('columbyApp')

  .service('DatasetSrv', function ($resource) {
    return $resource('api/v2/dataset/:id', {
        id: '@id'
      }, {
        query: { method: 'GET', isArray: false, responseType: 'json' },
        index: { method: 'GET', isArray: false, responseType: 'json' },
        update: { method: 'PUT' }
      }
    );
  })

  .service('DatasetDistributionSrv', function($resource) {

    return $resource('api/v2/dataset/:id/distribution/:did', {
      id: '@id',
      did: '@did',
    }, {
      update: {
        method: 'PUT',
      },
    }
    );
  })

  .service('DatasetReferencesSrv', function($resource) {

    return $resource('api/v2/dataset/:id/reference/:rid', {
      id: '@id',
      rid: '@rid',
    }, {
      update: {
        method: 'PUT',
      },
    });
  })
;
