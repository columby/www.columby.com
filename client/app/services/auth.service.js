'use strict';

angular.module('columbyApp')

  .service('AuthSrv', function($rootScope, $http, $auth, configSrv, UserSrv) {

    var permissionsList = [
      // user permissions
      'signin user',
      'register user',
      'view user',
      'edit user',
      'delete user',
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

      /**
       *
       * Authenticate a user login (email or oauth).
       *
       **/
      authenticate: function(provider) {

        // handle email login
        if (provider.service === 'email') {
          if (provider.register === 'false' ) {
            return $http.post(configSrv.apiRoot + '/v2/user/login', {email: provider.email}).then(function (response) {
              return response.data;
            });
          }
          if (provider.register === 'true' ) {
            return $http.post(configSrv.apiRoot + '/v2/user/register', provider).then(function (response) {
              return response.data;
            });
          }
        } else {
          // handle ouath login
          return $auth.authenticate(provider.service, {register:provider.register}).then(function(result){
            var user = {};
            if (result.data.user){
              console.log('setting user ', result.data.user);
              UserSrv.setUser(result.data.user);
            }
            return result.data;
          }).catch(function(data, status, headers, config) {
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


      hasPermission: function(permission, params){
        console.log('Checking permission: ' + permission + ' with params: ', params);
        // admin is always true
        console.log($rootScope.user);
        if ($rootScope.user.admin === true) {
          console.log('user is admin');
          return true;
        }

        switch (permission){
          // User permissions
          case 'signin user':
            return !$auth.isAuthenticated();
            break;
          case 'register user':
            return !$auth.isAuthenticated();
            break;
          case 'edit user':
            if (!$auth.isAuthenticated()) { return false; }
            if ($rootScope.user.primary.slug === params.slug) {
              return true;
            } else {
              return false;
            }
            break;
          case 'delete user':
            return false;
            break;

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


          // Account permissions
          case 'view account':
            return true;
            break;
          case 'create account':
            return false;
            break;
          case 'edit account':
            if (!$auth.isAuthenticated()) { return false; }
            if ($rootScope.user.primary.slug === params.slug) {
              return true;
            }
            return false;
            break;
          case 'delete account':
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
