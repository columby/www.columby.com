'use strict';

angular.module('columbyApp')

  .service('DatasetSrv', function ($resource) {
    return $resource('api/v2/dataset/:id', {
        id: '@id',
        offset: '@offset'
      }, {
        query: { method: 'GET', isArray: false, responseType: 'json' },
        index: { method: 'GET', isArray: false, responseType: 'json' },
        update: { method: 'PUT' },
        addTag: {
          method: 'POST',
          url: 'api/v2/dataset/:id/addTag'
        },
        removeTag: {
          method: 'POST',
          url: 'api/v2/dataset/:id/removeTag'
        }
      }
    );
  })

  .service('DatasetReferenceSrv', function($resource) {

    return $resource('api/v2/dataset/:id/reference/:rid', {
      id: '@id',
      rid: '@rid'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })
;
