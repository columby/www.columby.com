'use strict';

angular.module('columbyApp')

.service('ReferenceSrv', function($resource, configSrv) {

  return $resource(configSrv.apiRoot + '/v2/reference/:id', {
    id: '@id'
  }, {
    update: { method: 'PUT' }
  });
});
