(function() {
  'use strict';

  angular.module('columbyApp')
    .service('AuthSrv', function($log, $rootScope, $http, auth, store, appConstants, UserSrv) {

    return {

      /***
       *
       * Authentication functions
       *
       **/

      // Login
      login: function(){
        auth.signin({}, function(profile, token) {
          $log.debug(profile);
          $log.debug(token);
          // success callback
          store.set('profile', profile);
          store.set('token', token);
          $rootScope.user = profile;
        });
      },

      // Logout
      signout: function() {
        auth.signout();
        store.remove('profile');
        store.remove('token');
        $rootScope.user = {};
      },

      // Check if user is logged in
      isAuthenticated: function(){
        return auth.isAuthenticated;
      },

      // Authenticate the user with auth0
      authenticate: function(){
        var token = store.get('token');
        auth.authenticate(store.get('profile'), token);
        $rootScope.user = auth.profile;
      },

      /***
       *
       * Authorization functions
       *
       **/

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

        switch (permission) {

          // User permissions
          case 'signin user':
            return !auth.isAuthenticated;
          case 'signup user':
            return !auth.isAuthenticated;
          case 'verify user login':
            return !auth.isAuthenticated;
          case 'edit user':
            return $rootScope.user && ($rootScope.user.primary.slug === params.slug);
          case 'delete user':
            return false;


          // Account (organisation) permissions
          case 'create organisation':
            return false;
          case 'view organisation':
          case 'view account':
            $log.debug('Permision granted.');
            return true;
          case 'edit organisation':
          case 'edit account':
            if (!auth.isAuthenticated) { return false; }
            if ($rootScope.user.primary.slug === params.slug) {
              $log.debug('User primary account');
              return true;
            }
            // check if user has a valid role for the organisation
            for (var i=0; i<$rootScope.user.organisations.length; i++){
              // Check if user is connected to the organisation
              if ($rootScope.user.organisations[ i].slug === params.slug) {
                // Check for the proper role
                switch ($rootScope.user.organisations[ i].role ) {
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
            return auth.isAuthenticated;
          case 'edit dataset':
            // should be authenticated.
            if (!auth.isAuthenticated) { return false; }
            // check if dataset's publication account is in current user's primary and organisations list
            if ($rootScope.user.primary.id === params.account_id) {
              return  true;
            }
            // check if user has a valid role for the organisation
            for (i=0; i<$rootScope.user.organisations.length; i++){
              // Check if user is connected to the organisation
              if ($rootScope.user.organisations[ i].id === params.account_id) {
                var roles = [1,2,3];
                if (roles.indexOf($rootScope.user.organisations[ i].role) !== -1) {
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
