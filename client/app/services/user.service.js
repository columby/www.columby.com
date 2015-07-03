'use strict';

angular.module('columbyApp')

  .service('UserSrv', function($rootScope, $http, $auth, configSrv) {

    return {

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
        console.log('verify');
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


      getUser: function(id){
        var promise = $http.get(configSrv.apiRoot + '/v2/user/' + id).then(function (response) {
          return response.data;
        });
        return promise;
      }
    };
  }
);
