(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('AuthSrv', function($log,$rootScope, $http, $auth, appConstants, UserSrv) {

    // var permissionsList = [
    //   // user permissions
    //   'signin user',
    //   'register user',
    //   'verify user login',
    //   'view user',
    //   'edit user',
    //   'delete user',
    //   // organisation permissions
    //   'create organisation',
    //   'view organisation',
    //   'edit organisation',
    //   'delete organisation',
    //   // dataset permissions
    //   'create dataset',
    //   'view dataset',
    //   'edit dataset',
    //   'delete dataset',
    // ];


    function logout() {
      $auth.logout().then(function(){
        $rootScope.user = {};
        return true;
      });
    }


    return {

      /**
       *
       * Authenticate a user login (email or oauth).
       *
       **/
      authenticate: function(provider) {

        // handle email login
        if (provider.service === 'email') {
          if (provider.register === 'false' ) {
            return $http.post(appConstants.apiRoot + '/v2/user/login', {email: provider.email}).then(function (response) {
              return response.data;
            });
          }
          if (provider.register === 'true' ) {
            return $http.post(appConstants.apiRoot + '/v2/user/register', provider).then(function (response) {
              return response.data;
            });
          }
        } else {
          // handle ouath login
          return $auth.authenticate(provider.service, {register:provider.register}).then(function(result){
            if (result.data.user){
              $log.debug('setting user ', result.data.user);
              UserSrv.setUser(result.data.user);
            }
            return result.data;
          }).catch(function(data) {
            return data.data;
          });
        }
      },


      isAuthenticated: function(){
        return $auth.isAuthenticated();
      },


      logout: function(){
        return logout();
      },


      hasRole: function(roles){
        // Make no access the default, to be sure.
        var authorized = false;
        var userRoles;

        // make sure input is array
        if (!angular.isArray(roles)) {
          userRoles = [roles];
        }

        // Check for anonymous user
        if (!$rootScope.user || !$rootScope.user.id) {
          $log.debug('No user');
          userRoles = ['visitor'];
        } else {
          userRoles = ['authenticated'];
          for (var i=0; i<userRoles.length; i++){
            for (var j=0; j<$rootScope.user.roles.length; j++) {
              if ($rootScope.user.roles[ j] === userRoles[ i]) {
                authorized=true;
              }
            }
          }
        }

        return authorized;
      },


      hasPermission: function(permission, params){
        $log.debug('Checking permission: ' + permission + ' with params: ', params);

        // admin is always true
        if ($rootScope.user && ($rootScope.user.admin === true)) {
          $log.debug('user is admin');
          return true;
        }

        switch (permission){
          // User permissions
          case 'signin user':
            return !$auth.isAuthenticated();
          case 'register user':
            return !$auth.isAuthenticated();
          case 'verify user login':
            return !$auth.isAuthenticated();
          case 'edit user':
            if (!$auth.isAuthenticated()) { return false; }
            if ($rootScope.user && ($rootScope.user.primary.slug === params.slug)) {
              return true;
            } else {
              return false;
            }
            break;
          case 'delete user':
            return false;


          // Account permissions
          case 'create organisation':
            return false;
          case 'view organisation':
          case 'view account':
            return true;
          case 'edit organisation':
          case 'edit account':
            if (!$auth.isAuthenticated()) { return false; }
            if ($rootScope.user.primary.slug === params.slug) {
              $log.debug('User primary account');
              return true;
            }
            // check if user has a valid role for the organisation
            for (var i=0; i<$rootScope.user.organisations.length; i++){
              // Check if user is connected to the organisation
              if ($rootScope.user.organisations[ i].slug === params.slug) {
                // Check for the proper role
                switch ($rootScope.user.organisations[ i].UserAccounts.role ) {
                  case 1:
                  case 2:
                  case 3:
                    $log.debug('yes!');
                    return true;
                }
              }
            }
            return false;

          case 'delete organisation':
            return false;

          // Dataset permissions
          case 'create dataset':
            return $auth.isAuthenticated();
          case 'edit dataset':
            // should be authenticated.
            if (!$auth.isAuthenticated()) { return false; }
            // check if dataset's publication account is in current user's primary and organisations list
            if ($rootScope.user.primary.id === params.account_id) {
              return  true;
            }
            // check if user has a valid role for the organisation
            for (i=0; i<$rootScope.user.organisations.length; i++){
              // Check if user is connected to the organisation
              if ($rootScope.user.organisations[ i].id === params.account_id) {
                var role;
                // Check for the proper role
                switch ($rootScope.user.organisations[ i].UserAccounts.role ) {
                  case 1: case 2: case 3:
                    role = $rootScope.user.organisations[ i].UserAccounts.role;
                    return true;
                }
              }
            }
            return false;
          case 'view dataset':
            $log.debug('true');
            return true;
          case 'delete dataset':
            return false;


            /***
             *
             * Check if the current logged in user can edit an item
             *
             ***/
            // canEdit: function(type, item) {
            //
            //   var canEdit = false;
            //   var user = $rootScope.user;
            //
            //   if (!type || !item) { return canEdit; }
            //   if (user.admin === true) { return true; }
            //   if (this.isAuthenticated() === false) { return false; }
            //
            //   switch (type){
            //     case 'account':
            //       for (var i=0;i<user.accounts.length;i++){
            //         if (item.id === user.accounts[ i].id){
            //           if (
            //             (user.accounts[ i].role === 1) ||
            //             (user.accounts[ i].role === 2) ||
            //             (user.accounts[ i].role === 3)
            //           ) {
            //             canEdit = true;
            //           }
            //         }
            //       }
            //       break;
            //
            //     case 'dataset':
            //       for (i=0;i<user.accounts.length;i++){
            //         if (item.account.id === user.accounts[ i].id){
            //           if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
            //             canEdit = true;
            //           }
            //         }
            //       }
            //       break;
            //
            //     case 'collection':
            //       $log.debug('checking access for: ', item.account.id);
            //       for (i=0;i<user.accounts.length;i++){
            //         if (item.account.id === user.accounts[ i].id){
            //           if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
            //             $log.debug('canedit true: ', user.accounts[ i].role);
            //             canEdit = true;
            //           }
            //         }
            //       }
            //       break;
            //   }
            //   return canEdit;
            // }
          // default fallback
          default:
            $log.debug('No permission found, no access.');
            return false;
        }
      }
    };
  });
})();
