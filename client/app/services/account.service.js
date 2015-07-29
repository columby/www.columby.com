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

    // return {
    //   get: function(slug) {
    //     return $http.get(configSrv.apiRoot + '/v2/account/' + slug).then(function(response){
    //       return response.data;
    //     });
    //   },
    //
    //   update: function(account) {
    //     return $http.put(configSrv.apiRoot + '/v2/account/slug', account).then(function(response){
    //       console.log(response);
    //       return response.data;
    //     });
    //   },
    //
    //   updateRegistry: function(registry) {
    //     return $http.put(configSrv.apiRoot + '/v2/account/' + registry.account_id + '/registry/' + registry.id, registry).then(function(response){
    //       //console.log(response);
    //       return response.data;
    //     });
    //   }
    // };


  }
);
