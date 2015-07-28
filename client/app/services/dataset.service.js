'use strict';

angular.module('columbyApp')

.service('DatasetSrv', function($resource, configSrv) {

  return $resource(configSrv.apiRoot + '/v2/dataset/:id', {
    id: '@id',
    offset: '@offset',
    tid: '@tid',
    rid: '@rid'
  }, {

    query: { method: 'GET', isArray: false, responseType: 'json' },

    index: { method: 'GET', isArray: false, responseType: 'json' },

    update: { method: 'PUT' },

    addTag: {
      method: 'POST',
      url: configSrv.apiRoot + '/v2/dataset/:id/tag'
    },

    removeTag: {
      method: 'DELETE',
      url: configSrv.apiRoot + '/v2/dataset/:id/tag/:tid'
    },

    updateRegistry: {
      method: 'PUT',
      url: configSrv.apiRoot + '/v2/dataset/:id/registry/:rid'
    }
  });
});
