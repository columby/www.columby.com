(function() {
  'use strict';

  angular.module('columbyApp')
  .service('UserSrv', function($log, $rootScope, $http, appConstants) {

    var user;

    function setUser(u){
      console.log('set user');
      // update avatar links.
      if (u && u.id){
        if (u.primary.avatar){
          u.primary.avatar.url = appConstants.filesRoot + '/image/small/' + u.primary.avatar.path;
        }
        for (var i=0; i<u.organisations.length;i++){
          if (u.organisations[ i].avatar){
            u.organisations[ i].avatar.url = appConstants.filesRoot + '/image/small/' + u.organisations[ i].avatar.path;
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


      // get: function(slug){
      //   return $http.get(appConstants.apiRoot + '/v2/user/' + slug).then(function (response) {
      //     //$log.debug(response);
      //     return response.data;
      //   });
      // },


      /***
       *
       * Check the currently logged in user and save the response.
       *
       ***/
      // me: function() {
      //   return $http.post(appConstants.apiRoot + '/v2/user/me').then(function(result){
      //     // set fetched user
      //     if (result.data.id) {
      //       $rootScope.user = result.data;
      //     }
      //     return result.data;
      //   });
      // },


      // destroy: function(id) {
      //   $log.debug('deleting user ' + id);
      //   return $http.delete(appConstants.apiRoot + '/v2/user/' + id).then(function(result){
      //     if (result.data.status === 'success') {
      //       setUser({});
      //     }
      //     return result.data;
      //   });
      // }
    };
  });
})();
