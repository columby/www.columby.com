'use strict';

angular.module('columbyApp')

  .service('CollectionSrv', function ($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/collection/:id', {
      id: '@id',
      offset: '@offset'
    }, {
      index:   { method: 'GET', isArray: true, responseType: 'json' },
      show:    { method: 'GET', responseType: 'json' },
      update:  { method: 'PUT', responseType: 'json' },
      getDatasets: {
        method: 'GET',
        responseType: 'json',
        url: configSrv.apiRoot + '/v2/collection/:id/datasets'
      }
    }
    );

  })

;
