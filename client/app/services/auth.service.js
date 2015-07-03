'use strict';

angular.module('columbyApp')

  .service('AuthSrv', function($rootScope, $http, $auth, configSrv) {

    var permissionsList = [
      // user permissions
      'signin existing user',
      'register new user',
      'edit user settings',
      'delete user',
      // account permissions
      'view account',
      'edit account',
      // organisation permissions
      'create organisation',
      'view organisation',
      'edit organisation',
      'delete organisation',
      // dataset permissions
      'create dataset',
      'view dataset',
      'edit dataset',
      'delete dataset',
    ]


    function logout() {
      $auth.logout().then(function(){
        $rootScope.user = {};
        return true;
      });
    }

    return {
      login: function() { },

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
          authorizedRoles = [roles];
        }

        // Check for anonymous user
        if (!$rootScope.user || !$rootScope.user.id) {
          console.log('No user');
          userRoles = ['visitor'];
        } else {
          userRoles = ['authenticated'];
          for (var i=0; i<authorizedRoles.length; i++){
            for (var j=0; j<$rootScope.user.roles.length; j++) {
              if ($rootScope.user.roles[ j] === authorizedRoles[ i]) {
                authorized=true;
              }
            }
          }
        }

        return authorized;
      },

      hasPermission: function(permission){
        console.log('Checking permission: ' + permission);
        // admin is always true
        if ($rootScope.user.isAdmin === true) {
          console.log('user is admin');
          return true;
        }

        switch (permission){
          // User permissions
          case 'signin existing user':
            if (!$auth.isAuthenticated()) {
              return true;
            } else {
              return false;
            }
            break;
          case 'register new user':
            if (!$auth.isAuthenticated()) {
              return true;
            } else {
              return false;
            }
            break;
          case 'edit user settings':
            if ($auth.isAuthenticated()) {
              return true;
            } else {
              return false;
            }
            break;
          case 'delete user':
            return false;
            break;

          // Account permissions

          // isAuthorized: function(authorizedRoles) {
          //   // Make no access the default, to be sure.
          //   var authorized = false;
          //   var userRoles;
          //
          //   // make sure input is array
          //   if (!angular.isArray(authorizedRoles)) {
          //     authorizedRoles = [authorizedRoles];
          //   }
          //
          //   console.log($rootScope.user);
          //   // Check for anonymous user
          //   if (!$rootScope.user || !$rootScope.user.id) {
          //     console.log('No user');
          //     userRoles = ['visitor'];
          //   } else {
          //     userRoles = ['authenticated'];
          //     for (var i=0; i<authorizedRoles.length; i++){
          //       for (var j=0; j<$rootScope.user.roles.length; j++) {
          //         if ($rootScope.user.roles[ j] === authorizedRoles[ i]) {
          //           authorized=true;
          //         }
          //       }
          //     }
          //   }
          //
          //   console.log(userRoles);
          //   console.log('authorized' + authorized);
          //
          //
          //
          //   return authorized;
          // }
          case 'view account':
            return true;
            break;
          case 'edit account':
            return false;
            break;

          // Organisation permissions
          case 'create organisation':
            return false;
            break;
          case 'edit organisation':
            return false;
            break;
          case 'view organisation':
            return true;
            break;
          case 'delete organisation':
            return false;
            break;

          // Dataset permissions
          case 'create dataset':
            return false;
            break;
          case 'edit dataset':
            return false;
            break;
          case 'view dataset':
            return true;
            break;
          case 'delete dataset':
            return false;
            break;


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
            //       console.log('checking access for: ', item.account.id);
            //       for (i=0;i<user.accounts.length;i++){
            //         if (item.account.id === user.accounts[ i].id){
            //           if ( (user.accounts[ i].role === 1) || (user.accounts[ i].role === 2) || (user.accounts[ i].role === 3) ) {
            //             console.log('canedit true: ', user.accounts[ i].role);
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
            console.log('No permission found, no access.');
            return false;
        }
      }
    };

    // return $resource(configSrv.apiRoot + '/v2/account/:slug', {
    //     slug: '@slug'
    //   }, {
    //     update: { method: 'PUT', responseType: 'json' },
    //     addFile: {
    //       method: 'POST',
    //       url: 'api/v2/account/addFile'
    //     }
    //   }
    // );
  }
);
