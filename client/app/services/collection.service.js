'use strict';

angular.module('columbyApp')

  .service('CollectionSrv', function ($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/collection/:id', {
      id: '@id'
    }, {
      index:   { method: 'GET', isArray: true, responseType: 'json' },
      show:    { method: 'GET', responseType: 'json' },
      update:  { method: 'PUT', responseType: 'json' }
    }
    );

  })

;
