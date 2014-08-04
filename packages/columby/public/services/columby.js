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

  console.log(window.user);
  return {

    login: function(credentials) {
       var promise = $http.post('/api/v2/user/login', credentials)
        .then(function (response) {
          // The then function here is an opportunity to modify the response
          console.log(response.data);
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

    isAuthenticated: function() {
      return authenticated;
    },

    isAuthorized: function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return false; //(this.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
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

  $rootScope.$on('$stateChangeStart', function() {

  });

  return {

    setMessage: function(message) {
      queue.push(message);
    },

    getMessage: function() {
      currentMessage = queue.shift() || '';
      console.log('currentMessage set to: ' + currentMessage);
      return currentMessage;
    }
  };
}]);
