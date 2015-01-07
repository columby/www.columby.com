'use strict';

angular.module('columbyApp')

  .service('AccountSrv', function($resource, configSrv) {
    return $resource(configSrv.apiRoot + '/v2/account/:slug', {
        slug: '@slug'
      }, {
        update: { method: 'PUT', responseType: 'json' },
        addFile: {
          method: 'POST',
          url: 'api/v2/account/addFile'
        }
      }
    );
  }
);
