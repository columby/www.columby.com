/*
'use strict';

angular.module('mean.users')

.factory('AccountSrv', [
  '$http',
  function ($http) {

    return {
      getAccount: function(slug) {
        console.log('slug',slug);
        var promise = $http.get('/api/v2/account/' + slug)
          .then(function(response){
            console.log('account srv', response.data);
            return response.data;
          });
        return promise;
      }
    };
}]);
*/

'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.users')

.factory('AccountSrv', ['$resource', 'AuthSrv',

  function($resource, AuthSrv) {

    console.log('a', AuthSrv.columbyToken());
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
}])

;
