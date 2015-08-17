(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('DatasetSrv', function($resource, appConstants) {

    var url = appConstants.apiRoot + '/v2/dataset';

    return $resource(url + '/:id', {
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
        url: appConstants.apiRoot + '/v2/dataset/:id/tag'
      },

      removeTag: {
        method: 'DELETE',
        url: appConstants.apiRoot + '/v2/dataset/:id/tag/:tid'
      },

      updateRegistry: {
        method: 'PUT',
        url: appConstants.apiRoot + '/v2/dataset/:id/registry/:rid'
      }
    });
  });
})();
