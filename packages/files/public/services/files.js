'use strict';

angular.module('mean.files')

.factory('FilesSrv', ['$http', '$resource', 'AuthSrv',
  function($http, $resource, AuthSrv) {

    var File = $resource('api/v2/files/:id',{
      id: '@_id'
    }, {
      get: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT()
        }
      },
      save: {
        headers: {
          Authorization: AuthSrv.getColumbyJWT()
        }
      },
      update: {
        method: 'PUT',
        headers: {
          Authorization: AuthSrv.getColumbyJWT()
        }
      }
    });

    return File;
  }
]);
