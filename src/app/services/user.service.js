(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('UserSrv', function($log,$resource, $rootScope, $http, $auth, appConstants) {

      var user;

      function setUser(u){
        // update avatar links.
        if (u && u.id){
          if (u.primary.avatar){
            u.primary.avatar.url = appConstants.filesRoot + '/image/small/' + u.primary.avatar.filename;
          }
          for (var i=0; i<u.organisations.length;i++){
            if (u.organisations[ i].avatar){
              u.organisations[ i].avatar.url = appConstants.filesRoot + '/image/small/' + u.organisations[ i].avatar.filename;
            }
          }
        }
        user = u;
        $rootScope.user = user;
      }

      return {

        setUser: function(u){
          setUser(u);
        },
        user: function(){
          return user;
        },


        get: function(slug){
          //$log.debug(slug);
          return $http.get(appConstants.apiRoot + '/v2/user/' + slug).then(function (response) {
            //$log.debug(response);
            return response.data;
          });
        },


        /**
         *
         * Register a new user with email and username
         *
         **/
        register: function(credentials) {
          return $http.post(appConstants.apiRoot + '/v2/user/register', credentials).then(function (response) {
            return response.data;
          });
        },


        /**
         *
         * Verify a login token at the server, receive a JWT, user and store it.
         *
         **/
        verify: function(token) {
          $log.debug('verify');
          return $http.get(appConstants.apiRoot + '/v2/user/verify?token='+token).then(function (response) {

            $log.debug(response.data);

            if (response.data.token) {
              $log.debug('Setting token: ' + response.data.token);
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
          return $http.post(appConstants.apiRoot + '/v2/user/me').then(function(result){
            // set fetched user
            if (result.data.id) {
              $rootScope.user = result.data;
            }
            return result.data;
          });
        },


        destroy: function(id) {
          $log.debug('deleting user ' + id);
          return $http.delete(appConstants.apiRoot + '/v2/user/' + id).then(function(result){
            if (result.data.status === 'success') {
              setUser({});
            }
            return result.data;
          });
        }
      };
    }
  );
})();
