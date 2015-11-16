(function() {
  'use strict';

  angular
    .module('ng-app')
    .service('ReferenceSrv', function($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/reference/:id', {
      id: '@id'
    }, {
      update: { method: 'PUT' }
    });
  });
})();
