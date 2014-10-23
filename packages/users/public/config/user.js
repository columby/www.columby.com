'use strict';

angular.module('mean.users')

.config(function ($httpProvider) {
  //$httpProvider.interceptors.push('AuthInterceptor');
})

// Define authentication events
.constant('AUTH_EVENTS', {
  loginSuccess: 'authLoginSuccess',
  loginFailed: 'authLoginFailed',
  logoutSuccess: 'authLogoutSuccess',
  notAuthenticated: 'authNotAuthenticated',
  notAuthorized: 'authNotAuthorized'
})

// Check permission to view the page.
.run(['$rootScope', 'AUTH_EVENTS', '$state', 'AuthSrv', 'toaster',
  function ($rootScope, AUTH_EVENTS, $state, AuthSrv, toaster) {

    $rootScope.$on('$stateChangeStart', function (event, next) {

      // Check if there is authorization data attached to the route
      if (next.hasOwnProperty('authorization')) {

        // Check Authentication status needed
        if (next.authorization.hasOwnProperty('anonymousOnly')) {
          if (AuthSrv.isAuthenticated()){
            event.preventDefault();
            // Checking for Anonymous access only.
            toaster.pop('success', null, 'Anonymous access only.');
            // Redirect back to account page
            $state.go('home');
          }
        }
        // Check which roles is/are required
        else if (next.authorization.hasOwnProperty('authorizedRoles')) {
          console.log('authorizedroles', next.authorization);
          var authorizedRoles = next.authorization.authorizedRoles;

          // Check if user has the required role
          if (!AuthSrv.isAuthorized(authorizedRoles)) {

            event.preventDefault();
            toaster.pop('danger', null, 'You are not authorized to access the requested page');

            //If no previous state, go to home
            $state.go('home');
          }
        }
      }
    });
  }
]);
