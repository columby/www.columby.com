(function() {
  'use strict';

  angular.module('columbyApp').service('CategorySrv', function ($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/category/:id', {
      id: '@id',
      offset: '@offset',
      cid: '@cid'
    }, {
      index:   { method: 'GET', isArray: true, responseType: 'json' },
      show:    { method: 'GET', responseType: 'json' },
      update:  { method: 'PUT', responseType: 'json' },

      addDataset: {
        method: 'POST',
        url: appConstants.apiRoot + '/v2/category/:id/addDataset'
      },
      removeDataset: {
        method: 'DELETE',
        url: appConstants.apiRoot + '/v2/dataset/:id/removeDataset'
      },

      getDatasets: {
        method: 'GET',
        responseType: 'json',
        url: appConstants.apiRoot + '/v2/category/:id/datasets'
      }
    });
  });
})();
