'use strict';

angular.module('columbyApp')

  .service('RegistrySrv', function($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/registry/:id', {
        id: '@id'
      }, {
        update: { method: 'PUT' },
        validate: {
          method: 'POST',
          url: configSrv.apiRoot + '/v2/registry/validate'
        }
      }
    );
  })
;
