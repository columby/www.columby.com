'use strict';

angular.module('columbyApp')

  .service('PrimaryService', function($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/primary/:id', {
        id: '@id'
      }, {
        update: { method: 'PUT' }
      }
    );
  })
;
