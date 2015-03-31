'use strict';

angular.module('columbyApp')
  .service('AuthSrv', function ($rootScope, $http, configSrv) {

    // user object
    var user = {};
    // Token token for api access
    var columbyToken;

    function setUser(u){
      console.log('Set user: ', u);
      user = u;
      $rootScope.user = user;
    }

    function setToken(token){
      console.log('setting columby jwt token.', token);
      columbyToken = JSON.stringify(token);

      // Delete existing token
      localStorage.removeItem('columby_token');
      // save JWT token in local storage (browser)
      localStorage.setItem('columby_token', columbyToken);

    }

    return {

      // Getters and setters
      // setColumbyToken: function(token) {
      //   console.log('setting columby jwt token.', token);
      //   columbyToken = token;
      // },
      // columbyToken: function(){
      //   return columbyToken;
      // },
      //
      // setUser: function(u){
      //   console.log('Set user: ', u);
      //   user = u;
      //   $rootScope.user = user;
      // },
      // user: function()  { return user; },


      /**
       *
       * Login a user using an email-address
       *
       **/
      login: function(credentials) {
        var promise = $http.post(configSrv.apiRoot + '/v2/user/login', credentials)
          .then(function (response) {
            if (response.data.user){
              user = response.data.user;
            }
            return response.data;
          });
        return promise;
      },


      /**
       *
       * Register a new user with email and username
       *
       **/
      register: function(credentials) {
        var promise = $http.post(configSrv.apiRoot + '/v2/user/register', credentials)
          .then(function (response) {
            if (response.data.user){
              this.setUser(response.data.user);
            }
            return user;
          });
        return promise;
      },


      /**
       *
       * Verify a login token at the server, receive a JWT, user and store it.
       *
       **/
      verify: function(token) {
        var promise = $http.get(configSrv.apiRoot + '/v2/user/verify?token='+token)
          .then(function (response) {

            if (response.data.token) {
              setToken(response.data.token);
            }
            if (response.data.user){
              setUser(response.data.user);
            }

            return user;
          });
        return promise;
      },


      /**
       *
       * Logout a current user
       *
       **/
      logout: function(){
        // simply remove the jwt from the Authorization header and localstorage
        localStorage.removeItem('columby_token');
        columbyToken = null;
        this.setUser(null);
        return true;
      },


      // Check the currently logged in user and save the response
      me: function() {
        var promise = $http.post(configSrv.apiRoot + '/v2/user/me').then(function(result){
          if (result.data.status === 'error') {
            console.log('error',result.data.message);
          } else {
            setUser(result.data);
          }
          return true;
        });
        return promise;
      },


      /**
       *
       *
       *
       **/
      isAuthenticated: function() {
        return (user && user.hasOwnProperty('id')) ? true : false;
      },


      // Check if the current logged in user can edit an item
      canEdit: function(type, item) {

        var canEdit = false;

        if (!type || !item){
          return canEdit;
        }

        if (user.admin === true){
          return true;
        }

        //console.log('checking canEdit', type, item);
        if (this.isAuthenticated() === false) {
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


      // getProfile: function(slug) {
      //   var promise = $http.get(configSrv.apiRoot + '/v2/user/profile/' + slug, { headers: { 'Authorization': columbyToken } })
      //     .then(function(response){
      //       console.log('profile', response);
      //       return response.data;
      //     });
      //   return promise;
      // },
      //
      //
      // updateProfile: function(profile) {
      //   console.log('profile', profile);
      //   var promise = $http.put(configSrv.apiRoot + '/v2/user/profile', profile, {headers: {'Authorization': columbyToken}})
      //     .then(function(result){
      //       return result.data;
      //     });
      //   return promise;
      // }
    };

  });
