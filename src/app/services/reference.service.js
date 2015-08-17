(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('ReferenceSrv', function($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/reference/:id', {
      id: '@id'
    }, {
      update: { method: 'PUT' }
    });
  });
})();
