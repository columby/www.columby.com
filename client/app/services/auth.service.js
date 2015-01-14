'use strict';

angular.module('columbyApp')
  .service('AuthSrv', function ($http, configSrv) {

    // user object
    var user = {};
    // Token token for api access
    var columbyToken;

    return {

      // Getters and setters
      setColumbyToken: function(token) {
        console.log('setting columby jwt token.', token);
        columbyToken = token;
      },
      columbyToken: function(){
        return columbyToken;
      },

      setUser: function(u) { user = u;    },
      user: function()  { return user; },

      // Login a user using an email-address
      login: function(credentials) {
        var promise = $http.post(configSrv.apiRoot + '/v2/user/login', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            console.log(response);
            return response.data;
          });
        return promise;
      },

      // Register a new user with email and username
      register: function(credentials) {
        var promise = $http.post(configSrv.apiRoot + '/v2/user/register', credentials)
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
        var promise = $http.get(configSrv.apiRoot + '/v2/user/verify?token='+token)
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
        var promise = $http.post(configSrv.apiRoot + '/v2/user/me').then(function(result){
          user = result.data;
          return result.data;
        });
        return promise;
      },

      // Get information about a given user by user-id
      getUser: function(){
        console.log('getting the user srv');
        var promise = $http.get(configSrv.apiRoot + '/v2/user')
          .then(function(result){
            console.log('fetched user', result.data);
            return result.data[0];
          });
        return promise;
      },

      isAuthenticated: function() {
        return (user && user.hasOwnProperty('id')) ? true : false;
      },

      /**
       *
       * Check if a user has a
       * @param authorizedRoles
       * @returns {*|boolean}
       */
      hasUserRole: function(authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        var trustedRole = false;
        var accountRoles = null;
        if (user && user.accounts){
          //accountRoles = user.accounts[ selectedAccount].roles;
        }
        if (accountRoles) {
          console.log('user roles,', accountRoles);
          trustedRole = authorizedRoles.every(function(v) {
            return accountRoles.indexOf(v) !== -1;
          });
        }

        return (this.isAuthenticated() && trustedRole);
      },

      hasAccountRole:function(){

      },

      // Check if the current logged in user can edit an item
      canEdit: function(type, item) {

        var canEdit = false;
        //console.log('check auth');

        if (user.admin === true){
          //console.log('admin true');
          return true;
        }

        //console.log('checking canEdit', type, item);
        if (this.isAuthenticated() === false) {
          console.log('user is not authenticated');
          return false;
        }

        switch (type){
          case 'account':
            for (var i=0;i<user.accounts.length;i++){
              if (item.id === user.accounts[ i].id){
                if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
                  canEdit = true;
                }
              }
            }
            break;
          case 'dataset':
            console.log(item.account.id);
            for (i=0;i<user.accounts.length;i++){
              if (item.account.id === user.accounts[ i].id){
                if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
                  console.log('canedit true: ', user.accounts[ i].role);
                  canEdit = true;
                }
              }
            }
            break;
        }

        return canEdit;
      },


      getProfile: function(slug) {
        var promise = $http.get(configSrv.apiRoot + '/v2/user/profile/' + slug, { headers: { 'Authorization': columbyToken } })
          .then(function(response){
            console.log('profile', response);
            return response.data;
          });
        return promise;
      },

      updateProfile: function(profile) {
        console.log('profile', profile);
        var promise = $http.put(configSrv.apiRoot + '/v2/user/profile', profile, {headers: {'Authorization': columbyToken}})
          .then(function(result){
            return result.data;
          });
        return promise;
      }
    };

  });
