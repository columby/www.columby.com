'use strict';

angular.module('columbyApp')

  .service('AccountSrv', function($rootScope, $http, $auth, configSrv) {

    return {
      get: function(slug) {
        return $http.get(configSrv.apiRoot + '/v2/account/' + slug).then(function(response){
          return response.data;
        });
      },

      update: function(account) {
        return $http.put(configSrv.apiRoot + '/v2/account/slug', account).then(function(response){
          console.log(response);
          return response.data;
        });
      }
    };

    // return $resource(configSrv.apiRoot + '/v2/account/:slug', {
    //     slug: '@slug'
    //   }, {
    //     update: { method: 'PUT', responseType: 'json' },
    //     addFile: {
    //       method: 'POST',
    //       url: 'api/v2/account/addFile'
    //     }
    //   }
    // );
  }
);
