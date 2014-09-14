'use strict';

angular.module('mean.account')

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
.run(function ($rootScope, AUTH_EVENTS, $state, AuthSrv, toaster) {

  $rootScope.$on('$stateChangeStart', function (event, next) {

    // Check if there is authorization data attached to the route
    if (next.hasOwnProperty('authorization')) {

      // Check Authentication status needed
      if (next.authorization.hasOwnProperty('anonymousOnly')) {
        if (AuthSrv.isAuthenticated()){
          event.preventDefault();
          // Checking for Anonymous access only.
          toaster.pop('success', 'Logged in', 'You are already logged in.');
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
          toaster.pop('success', 'Not authorized', 'You are not authorized to access the requested page');

          //If no previous state, go to home
          $state.go('home');
        }
      }
    }
  });
})

;
