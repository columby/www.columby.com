'use strict';

angular.module('columbyApp')

  .service('UserSrv', function($rootScope, $http, $auth, configSrv) {

    function logout() {
      $auth.logout().then(function(){
        $rootScope.user = {};
        return true;
      });
    }


    return {

      /**
       *
       * Check if a user is authenticated.
       *
       */
      isAuthenticated: function(){
        return $auth.isAuthenticated() ;
      },


      /**
       *
       * Login a user using an email-address,
       *
       **/
      login: function(credentials) {
        return $http.post(configSrv.apiRoot + '/v2/user/login', credentials).then(function (response) {
          return response.data;
        });
      },


      /**
       *
       * Register a new user with email and username
       *
       **/
      register: function(credentials) {
        return $http.post(configSrv.apiRoot + '/v2/user/register', credentials).then(function (response) {
          return response.data;
        });
      },


      /**
       *
       * Verify a login token at the server, receive a JWT, user and store it.
       *
       **/
      verify: function(token) {
        return $http.get(configSrv.apiRoot + '/v2/user/verify?token='+token).then(function (response) {

          console.log(response.data);

          if (response.data.token) {
            console.log('Setting token: ' + response.data.token);
            localStorage.setItem('columby_token', response.data.token);
          }
          if (response.data.user){
            $rootScope.user = response.data.user;
          }
          return response.data;
        });
      },


      /***
       *
       * Check the currently logged in user and save the response.
       *
       ***/
      me: function() {
        return $http.post(configSrv.apiRoot + '/v2/user/me').then(function(result){
          // set fetched user
          if (result.data.id) {
            $rootScope.user = result.data
          }
          return result.data;
        });
      },


      /**
       *
       * Check if a user has a role
       *
       */
      hasRole: function(authorizedRoles) {
        // Make sure it is an array
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        var trustedRole = false;
        var accountRoles = null;
        var user = $rootScope.user;
        if (user && user.accounts){
          //accountRoles = user.accounts[ selectedAccount].roles;
        }
        if (accountRoles) {
          trustedRole = authorizedRoles.every(function(v) {
            return accountRoles.indexOf(v) !== -1;
          });
        }

        return (trustedRole);
      },


      getUser: function(id){
        var promise = $http.get(configSrv.apiRoot + '/v2/user/' + id).then(function (response) {
          return response.data;
        });
        return promise;
      },


      /**
       *
       * Logout current user.
       *
       */
      logout: function(){
        return logout();
      },


      /***
       *
       * Check if the current logged in user can edit an item
       *
       ***/
      canEdit: function(type, item) {

        var canEdit = false;
        var user = $rootScope.user;
        
        if (!type || !item) { return canEdit; }
        if (user.admin === true) { return true; }
        if (this.isAuthenticated() === false) { return false; }

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
            for (i=0;i<user.accounts.length;i++){
              if (item.account.id === user.accounts[ i].id){
                if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
                  canEdit = true;
                }
              }
            }
            break;

          case 'collection':
            console.log('checking access for: ', item.account.id);
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
      }
    };
  }
);
