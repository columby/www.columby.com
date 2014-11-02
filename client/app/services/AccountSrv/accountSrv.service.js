'use strict';

angular.module('columbyApp')

.service('AccountSrv', function($resource, AuthSrv) {

    return $resource('api/v2/account/:slug', {
      slug: '@slug'
    }, {
      update: {
        method: 'PUT',
        headers: {
          Authorization: AuthSrv.columbyToken()
        }
      },
      get: {
        headers: {
          Authorization: AuthSrv.columbyToken()
        }
      },
      save: {
        method: 'POST',
        headers: {
          Authorization: AuthSrv.columbyToken()
        }
      },
    }
  );
});
