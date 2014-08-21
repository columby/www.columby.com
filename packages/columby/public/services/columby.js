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
          console.log('authResponse', response.data);
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
          console.log(response.data);
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
      console.log('authorizedRoles', authorizedRoles);
      console.log('user roles', user.roles);
      var trustedRole = false;
      if (user.roles) {
        trustedRole = authorizedRoles.every(function(v,i) {
          return user.roles.indexOf(v) !== -1;
        });
      }

      return (authenticated && trustedRole);
    },

    canEdit: function(content){
      var ret = false;
      // check role
      ret = this.isAuthorized('administrator');
      // check author
      console.log('check can edit');
      if (content.user) {
        if (content.user.hasOwnProperty('_id')) {
          if (content.user._id === user._id) {
            ret=true;
          }
        }
      }
      console.log('c', content);
      switch (content.postType){
        case 'profile':
          console.log(content._id);
          console.log(user._id);
          if (content._id === user._id) {
            ret = true;
          }
        break;
      }
      return ret;
    },


    getProfile: function(userSlug) {
      var promise = $http.get('/api/v2/user/profile?slug=' + userSlug)
        .then(function(response){
          return response.data;
        });
      return promise;
    },

    user: function() {
      return user;
    }
  };

});
