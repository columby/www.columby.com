'use strict';

angular.module('columbyApp')

  .service('UserSrv', function($rootScope, $http, configSrv) {

    return {

      /**
       *
       * Check if a user has a
       *
       */
      hasRole: function(authorizedRoles) {
        // Make sure it is an array
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        var trustedRole = false;
        var accountRoles = null;
        var user = $rootScope.user;
        if (user && user.accounts){
          //accountRoles = user.accounts[ selectedAccount].roles;
        }
        if (accountRoles) {
          trustedRole = authorizedRoles.every(function(v) {
            return accountRoles.indexOf(v) !== -1;
          });
        }

        return (trustedRole);
      },


      getUser: function(id){
        var promise = $http.get(configSrv.apiRoot + '/v2/user/' + id).then(function (response) {
          return response.data;
        });
        return promise;
      }
    };
  }
);
