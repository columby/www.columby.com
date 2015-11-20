'use strict';

/**
 *
 * Main module of the application.
 */
angular
  .module('columbyworkerApp', [
    'ngResource',
    'ngSanitize',
    'ui.bootstrap',
    'angular-jwt',
    'ngNotify',
    'ui.router',
    'auth0',
    'angular-storage'
  ])


  .constant('appConstants', {
    'appTitle': '[DEVELOP] Columby',
    'debug': true,
    'env': 'development',
    'auth0': {
      'domain': 'columby-dev.eu.auth0.com',
      'clientID': 'Ll9p3ipwQdthB5fBGG3vg783SQckzTKj'
    },
    'version': '1.2.0.1'
  })


  .run(function($log, $rootScope, $state, ngNotify, AuthSrv, appConstants, auth, store, jwtHelper) {
    $rootScope.config = appConstants;

    // Auth0 authentication events
    auth.hookEvents();

    // Notification settings
    ngNotify.config({
      theme: 'pure',
      position: 'bottom',
      duration: 3000,
      type: 'info',
      sticky: false
    });

    // Check permission for each state change
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

      // Auth0 token check
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)){
          if (!auth.isAuthenticated) {
            AuthSrv.authenticate();
          }
        }
      }

      if (toState.data && toState.data.permission) {
        if (!AuthSrv.hasPermission(toState.data.permission, toParams)) {
          event.preventDefault();
          $state.go('home');
          ngNotify.set('Sorry, you have no access to the requested page.', 'error');
        }
      }
    });
  })


  .config(function($logProvider, $locationProvider, $urlRouterProvider, appConstants, authProvider, $httpProvider, jwtInterceptorProvider) {

    // Enable/Disable log
    $logProvider.debugEnabled(appConstants.debug);

    $locationProvider.html5Mode(true).hashPrefix('!');
    $urlRouterProvider.otherwise('/');

    // Auth0 configuration
    authProvider.init({
      domain: appConstants.auth0.domain,
      clientID: appConstants.auth0.clientID,
      loginState: 'user.signin'
    });

    // We're annotating this function so that the `store` is injected correctly when this file is minified
    jwtInterceptorProvider.tokenGetter = ['store', function(store) {
      // Return the saved token
      return store.get('token');
    }];
    $httpProvider.interceptors.push('jwtInterceptor');
  })


  // Run once during startup
  .run(function($log, $rootScope, $http, AuthSrv, configSrv){

    $rootScope.user = {};
    $rootScope.config = configSrv;

    if (localStorage.getItem('columby_token')) {
      AuthSrv.me().then(function (response) {
        console.log(response);
        if (response.status === 'error') {
          localStorage.removeItem('columby_token');

        }
        if (response.id) {
          $rootScope.user = response;
        }
      });
    }
  });
