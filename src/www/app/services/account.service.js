(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('AccountSrv', function($resource, appConstants) {

      return $resource(appConstants.apiRoot + '/v2/account/:slug', {
          slug: '@slug',
          id: '@id',
          rid: '@rid',
          username: '@username'
        }, {
          update: {
            method: 'PUT',
            url: appConstants.apiRoot + '/v2/account/:id',
            responseType: 'json',
          },
          addUser: {
            method: 'POST',
            url: appConstants.apiRoot + '/v2/account/:id/addUser'
          },
          removeUser: {
            method: 'POST',
            url: appConstants.apiRoot + '/v2/account/:id/removeUser'
          },
          addFile: {
            method: 'POST',
            url: appConstants.apiRoot + '/v2/account/:id/addFile'
          },
          updateRegistry: {
            method: 'PUT',
            url: appConstants.apiRoot + '/v2/account/:id/registry/:rid'
          },
          addDefaultCategories: {
            method: 'POST',
            url: appConstants.apiRoot + '/v2/account/:id/defaultcategories'
          },
          search: {
            method: 'GET',
            url: appConstants.apiRoot + '/v2/account/search'
          }
        }
      );
    }
  );
})();
