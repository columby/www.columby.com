'use strict';

angular.module('mean.account')

.factory('AuthSrv', [
  '$http',
  function ($http) {
    // user object
    var user = (window.user.hasOwnProperty('account')) ? window.user.account : {};

    return {

      login: function(credentials){
        var promise = $http.post('/api/v2/user/login', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      register: function(credentials){
        var promise = $http.post('/api/v2/user/register', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      // Verify a login token.
      verify: function(token){
        var promise = $http.get('/api/v2/user/verify?token='+token)
          .then(function (response) {
            console.log('USer after verify login', response);
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      logout: function(){
        var promise = $http.get('/api/v2/user/logout')
          .then(function(response){
            user = {};
            return response.data;
          });
        return promise;
      },

      // Get account of currently logged in user, and save it as the main user object
      getAccount: function(){
        var promise = $http.get('/api/v2/user/account')
          .then(function(result){
            console.log('fetched account', result.data.account);
            user = result.data.account;
            return result.data;
          });
        return promise;
      },

      updateAccount: function(id,account){
        var update = {
          update: {
            id: id,
            account:account
          }
        };
        var promise = $http.put('/api/v2/user/account', update)
          .then(function(result){
            return result.data;
          });
        return promise;
      },

      isAuthenticated: function() {
        var authenticated = (user && user.hasOwnProperty('_id')) ? true : false;
        return authenticated;
      },

      isAuthorized: function(authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        var trustedRole = false;
        if (user.roles) {
          console.log('user roles,', user.roles);
          trustedRole = authorizedRoles.every(function(v,i) {
            return user.roles.indexOf(v) !== -1;
          });
        }

        return (this.isAuthenticated() && trustedRole);
      },

      // Check if the current logged in user can edit an item
      canEdit: function(item){

        var allowEdit = false;

        // Admin can edit everything
        allowEdit = this.isAuthorized('administrator');

        // Define access based on content type
        switch (item.postType) {
          case 'profile':
            // edit own content
            if (item._id === user._id) {
              allowEdit = true;
            }
          break;

          case 'dataset':
            // check if logged in user is author
            if (item.publisher) {
              if (item.publisher.hasOwnProperty('_id')) {
                if (item.publisher._id === user._id) {
                  allowEdit = true;
                }
              }
            }
          break;
        }

        return allowEdit;
      },

      user: function() {
        return user;
      },

      setJWT: function(token){
        $http.defaults.headers.common.Authorization = token;
      }
    };
}]);
