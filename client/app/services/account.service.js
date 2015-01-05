'use strict';

angular.module('columbyApp')

  .service('AccountSrv', function($resource, configService) {
    return $resource(configService.apiRoot + '/v2/account/:slug', {
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
