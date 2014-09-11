'use strict';

angular.module('mean.users')

.factory('UserSrv', ['$http',
  function($http) {
    console.log('MeanUser loaded');

    return {

      getProfile: function(userSlug) {
        console.log('fetching profile');
        var promise = $http.get('/api/v2/user/profile?slug=' + userSlug)
          .then(function(response){
            return response.data;
          });
        return promise;
      },

      updateProfile: function(profile) {
        var promise = $http.put('/api/v2/user/profile', profile)
          .then(function(result){
            return result.data;
          });
        return promise;
      },

    };
  }
]);
