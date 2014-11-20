'use strict';

angular.module('columbyApp')

.service('AccountSrv', function($resource, AuthSrv) {

    return $resource('api/v2/account/:slug', {
      slug: '@slug'
    }, {
      update: {
        method: 'PUT'
      }
    }
  );
});
