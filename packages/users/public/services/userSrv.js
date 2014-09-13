'use strict';

angular.module('mean.users')

.factory('UserSrv', ['$http',
  function($http) {
    console.log('MeanUser loaded');

    return {

      getProfile: function(slug) {
        var promise = $http.get('/api/v2/user/profile/' + slug)
          .then(function(response){
            console.log('profile', response);
            return response.data;
          });
        return promise;
      },

      updateProfile: function(profile) {
        console.log('profile', profile);
        var promise = $http.put('/api/v2/user/profile', profile)
          .then(function(result){
            return result.data;
          });
        return promise;
      },

    };
  }
]);
