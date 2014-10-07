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
angular.module('mean.users').factory('AccountSrv', ['$resource',

  function($resource) {

    return $resource('api/v2/account/:slug', {
      slug: '@slug'
    }, {
      update: {
        method: 'PUT'
      }
    }
    );
  }
]);