'use strict';

angular.module('mean.users')

.factory('AuthSrv', [
  '$http',
  function ($http) {
    // user object
    var user = (window.hasOwnProperty('user')) ? window.user : {};

    var columbyJWT;

    return {

      setColumbyJWT: function(token){
        columbyJWT = 'Bearer ' + token;
      },

      getColumbyJWT: function(){
        return columbyJWT;
      },

      login: function(credentials){
        //https://docs.angularjs.org/api/ng/service/$http#post
        var promise = $http.post('/api/v2/user/login', credentials, {headers: {'Authorization': columbyJWT}})
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
        var promise = $http.get('/api/v2/user/logout', {headers: {'Authorization': columbyJWT}})
          .then(function(response){
            user = {};
            return response.data;
          });
        return promise;
      },

      // Get account of currently logged in user, and save it as the main user object
      getUser: function(){
        var promise = $http.get('/api/v2/user', {headers: {'Authorization': columbyJWT}})
          .then(function(result){
            console.log('fetched user', result.data);
            user = result.data;
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
          case 'account':
            // edit own content
            for (var i=0; i<user.accounts.length; i++){
              if (item._id === user.accounts[ i]._id) {
                allowEdit = true;
              }
            }
          break;

          case 'dataset':
            // check if logged in user is publisher of the account
            if (item.hasOwnProperty('account')) {
              if (item.account.hasOwnProperty('_id')) {
                for (var k=0; k<user.accounts.length; k++){
                  if (item.account._id === user.accounts[ k]._id) {
                    allowEdit = true;
                  }
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

      getProfile: function(slug) {
        var promise = $http.get('/api/v2/user/profile/' + slug, {headers: {'Authorization': columbyJWT}})
          .then(function(response){
            console.log('profile', response);
            return response.data;
          });
        return promise;
      },

      updateProfile: function(profile) {
        console.log('profile', profile);
        var promise = $http.put('/api/v2/user/profile', profile, {headers: {'Authorization': columbyJWT}})
          .then(function(result){
            return result.data;
          });
        return promise;
      }
    };
}]);
