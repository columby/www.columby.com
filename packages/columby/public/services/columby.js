'use strict';

angular.module('mean.columby').factory('Columby', [
  function() {
    return {
      name: 'columby'
    };
  }
]);


angular.module('mean.columby').factory('ColumbyAuthSrv', function ($http) {
  var user = window.user;
  var authenticated = (user.hasOwnProperty('_id')) ? true : false;

  return {

    passwordlessLogin: function(credentials){
      var promise = $http.post('/api/v2/user/passwordless-login', credentials)
        .then(function (response) {
          if (response.data.user){
            user = response.data.user;
          }
          return response.data;
        });
      return promise;
    },

    passwordlessRegister: function(credentials){
      var promise = $http.post('/api/v2/user/passwordless-register', credentials)
        .then(function (response) {
          if (response.data.user){
            user = response.data.user;
          }
          return response.data;
        });
      return promise;
    },

    // Verify a login token.
    passwordlessVerify: function(token){
      var promise = $http.get('/api/v2/user/passwordless-verify?token='+token)
        .then(function (response) {
          if (response.data.user){
            user = response.data.user;
            authenticated = (user.hasOwnProperty('_id')) ? true : false;
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

    isAuthenticated: function() {
      return authenticated;
    },

    isAuthorized: function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      var trustedRole = false;
      if (user.roles) {
        trustedRole = authorizedRoles.every(function(v,i) {
          return user.roles.indexOf(v) !== -1;
        });
      }

      return (authenticated && trustedRole);
    },

    /**
     * Check if the current logged in user can edit an item
     *
     **/
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
          if (item.user) {
            if (item.user.hasOwnProperty('_id')) {
              if (item.user._id === user._id) {
                allowEdit = true;
              }
            }
          }
        break;
      }

      return allowEdit;
    },


    getProfile: function(userSlug) {
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

    // Get account of currently logged in user, and save it as the main user object
    getAccount: function(){
      var promise = $http.get('/api/v2/user/account')
        .then(function(result){
          user = result.data;
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

    user: function() {
      return user;
    }
  };

});
