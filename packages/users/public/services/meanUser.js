'use strict';

angular.module('mean.users').factory('MeanUser', [
  function() {
    console.log('MeanUser loaded');
    return {
      name: 'users'
    };
  }
]);


angular.module('mean.users').factory('AuthSrv', ['$rootScope', function($rootScope){

  var user = {
    user: window.user,
    authenticated: false,
    isAdmin: false
  };

  return {

    setUser: function(usr) {
      console.log('setting user to: ' + usr);
      user = usr;
      $rootScope.user = user;
    },

    getUser: function() {
      return user;
    }
  };
}]);
