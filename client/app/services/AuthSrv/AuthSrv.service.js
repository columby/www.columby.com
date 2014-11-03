'use strict';

angular.module('columbyApp')
  .service('AuthSrv', function ($http) {

    // user object
    var user = {};
    // selected publication account
    var selectedAccount = 0;
    // Token token for api access
    var columbyToken;

    return {

      // Getters and setters
      setColumbyToken: function(token) {
        columbyToken = 'Bearer ' + token;
      },
      columbyToken: function(){
        return columbyToken;
      },

      setUser: function(u) { user = u;    },
      user: function()  { return user; },

      setSelectedAccount: function(a) { selectedAccount = a;    },
      selectedAccount: function()  { return selectedAccount; },

      getConfig:function(){
        var promise = $http.post('api/v2/user/config').then(function(result){
            console.log('authconfig', result);
          return result.data;
        });
        return promise;
      },

      // Login a user using an email-address
      login: function(credentials) {
        var promise = $http.post('/api/v2/user/login', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      // Register a new user with email and username
      register: function(credentials) {
        var promise = $http.post('/api/v2/user/register', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      // Verify a login token at the server and receive a JWT.
      verify: function(token){
        var promise = $http.get('/api/v2/user/verify?token='+token)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },

      // Logout a current user
      logout: function(){
        // simply remove the jwt from the Authorization header and localstorage
        localStorage.removeItem('columby_token');
        columbyToken = null;
        user = null;
      },

      // Check the currently logged in user and save the response
      me: function() {
        var promise = $http.post('api/v2/user/me').then(function(result){
          user = result.data;
          return result.data;
        });
        return promise;
      },

      // Get information about a given user by user-id
      getUser: function(){
        console.log('getting the user srv');
        var promise = $http.get('/api/v2/user')
          .then(function(result){
            console.log('fetched user', result.data);
            return result.data[0];
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
        var accountRoles = null;
        if (user && user.accounts && user.accounts[ selectedAccount]){
          accountRoles = user.accounts[ selectedAccount].roles;
        }
        if (accountRoles) {
          console.log('user roles,', accountRoles);
          trustedRole = authorizedRoles.every(function(v) {
            return accountRoles.indexOf(v) !== -1;
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
        if (user && user.accounts) {
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
              for (i = 0; i < user.accounts.length; i++) {
                if (user.accounts[ i]._id === item._id) {
                  allowEdit = true;
                }
              }
            break;
          }
        }

        return allowEdit;
      },


      getProfile: function(slug) {
        var promise = $http.get('/api/v2/user/profile/' + slug, {headers: {'Authorization': columbyToken}})
          .then(function(response){
            console.log('profile', response);
            return response.data;
          });
        return promise;
      },

      updateProfile: function(profile) {
        console.log('profile', profile);
        var promise = $http.put('/api/v2/user/profile', profile, {headers: {'Authorization': columbyToken}})
          .then(function(result){
            return result.data;
          });
        return promise;
      }
    };

  });
