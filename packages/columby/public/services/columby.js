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
          return response.data;
        });
      return promise;
    },

    passwordlessRegister: function(credentials){
      var promise = $http.post('/api/v2/user/passwordless-register', credentials)
        .then(function (response) {
          console.log('authRegisterResponse', response.data);
          return response.data;
        });
      return promise;
    },

    passwordlessVerify: function(token){
      var promise = $http.get('/api/v2/user/passwordless-verify?token='+token)
        .then(function (response) {
          console.log('authResponse', response.data);
          return response.data;
        });
      return promise;
    },

    login: function(credentials) {
      var promise = $http.post('/api/v2/user/login', credentials)
        .then(function (response) {
          // The then function here is an opportunity to modify the response
          //console.log(response.data);
          // The return value gets picked up by the then in the controller.
          if (response.data.status === 'success') {
            user = response.data.user;
            return response.data;
          } else {
            return response.data;
          }
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

    register: function(credentials){
      var promise = $http.post('/api/v2/user/register', credentials)
        .then(function(response){
          //console.log(response);
          return response.data;
        });
        return promise;
    },

    verify: function(token){
      var promise = $http.get('/api/v2/user/verify?token=' + token)
       .then(function (response) {
         if (response.data.status === 'success') {
           user = response.data.user;
           return response.data;
         } else {
           return response.data;
         }
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
      return (this.isAuthenticated() && authorizedRoles.indexOf(user.roles[0]) !== -1);
    },

    user: function() {
      return user;
    }
  };

});

/***
 * Message Flash Service
 ***/
angular.module('mean.columby').factory('FlashSrv', ['$rootScope', function($rootScope) {
  var queue = [];
  var currentMessage = '';

  return {

    setMessage: function(message) {
      //console.log('Adding message: ' + message);
      queue.push(message);
    },

    getMessage: function() {
      currentMessage = queue.shift() || '';
      //console.log('Getting Message');
      //console.log(currentMessage);
      return currentMessage;
    }
  };
}]);
