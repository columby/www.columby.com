'use strict';

angular.module('mean.users')

.factory('AccountSrv', [
  '$http',
  function ($http) {

    return {
      getAccount: function(slug) {
        var promise = $http.get('/api/v2/account/' + slug)
          .then(function(response){
            console.log('account', response.data);
            return response.data;
          });
        return promise;
      }
    };
}]);
