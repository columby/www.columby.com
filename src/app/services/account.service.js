(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('AccountSrv', function($resource, $rootScope, $http, $auth, appConstants) {

      return $resource(appConstants.apiRoot + '/v2/account/:slug', {
          slug: '@slug',
          id: '@id',
          rid: '@rid'
        }, {
          update: {
            method: 'PUT',
            url: appConstants.apiRoot + '/v2/account/:id',
            responseType: 'json',
          },
          addFile: {
            method: 'POST',
            url: appConstants.apiRoot + '/v2/account/:id/addFile'
          },
          updateRegistry: {
            method: 'PUT',
            url: appConstants.apiRoot + '/v2/account/:id/registry/:rid'
          },
        }
      );
    }
  );
})();
