'use strict';

angular.module('columbyApp')

  .service('AccountSrv', function($resource, $rootScope, $http, $auth, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/account/:slug', {
        slug: '@slug',
        id: '@id',
        rid: '@rid'
      }, {
        update: {
          method: 'PUT',
          url: configSrv.apiRoot + '/v2/account/:id',
          responseType: 'json',
        },
        addFile: {
          method: 'POST',
          url: configSrv.apiRoot + '/v2/account/:id/addFile'
        },
        updateRegistry: {
          method: 'PUT',
          url: configSrv.apiRoot + '/v2/account/:id/registry/:rid'
        },
      }
    );
  }
);
