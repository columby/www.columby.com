'use strict';

angular.module('columbyworkerApp')
  .service('AuthSrv', function ($http, configSrv) {

    // user object
    var user = {};
    // Token token for api access
    var columbyToken;

    return {

      // Getters and setters
      setToken: function(token) {
        console.log('setting columby jwt token.', token);
        columbyToken = token;
      },
      token: function(){
        return columbyToken;
      },

      setUser: function(u) { user = u;    },
      user: function()  { return user; },

      // Check the currently logged in user and save the response
      me: function() {
        return $http.post(configSrv.apiRoot + '/v2/user/me').then(function(result){
          console.log(result);
          user = result.data;
          return result.data;
        });
      },

      isAuthenticated: function() {
        return (user && user.hasOwnProperty('id')) ? true : false;
      },

      isAdmin: function(){

      }
    };

  });
