'use strict';

angular.module('columbyApp')

  .service('AccountSrv', function($rootScope, $http, $auth, configSrv) {

    return {
      get: function(slug) {
        return $http.get(configSrv.apiRoot + '/v2/account/' + slug).then(function(result){
          console.log(result);
          var user = result.data;
          $rootScope.user = user;
          if (!user){
            logout();
          }

          return user;
        });
      },

      update: function(account) {
        return $http.put(configSrv.apiRoot + '/v2/account/:slug', account);
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
