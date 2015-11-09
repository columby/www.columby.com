(function () {
  'use strict';

  angular.module('columbyApp')
  .config (function ($logProvider, $locationProvider, $urlRouterProvider, appConstants, authProvider, $httpProvider, jwtInterceptorProvider) {

    // Enable log
    $logProvider.debugEnabled(appConstants.debug);

    /* **
     * Use the HTML5 History API
     * For any unmatched url, redirect to /
     * **/
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



    // /* **
    //  * Authentication configuration.
    //  *   Satellizer settings
    //  * **/
    // // Setup token name
    // $authProvider.tokenName = 'token';
    // $authProvider.tokenPrefix = 'columby';
    // $authProvider.withCredentials = false;
    // // Setup Google authentication provider
    // $authProvider.google({
    //   url: appConstants.apiRoot + '/v2/auth/google',
    //   clientId: '313936519511-lklf0npbiafkj3iregop6cle0n8hrpd9.apps.googleusercontent.com',
    //   scope: ['profile', 'email'],
    //   redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
    //   requiredUrlParams: ['scope'],
    //   optionalUrlParams: ['display']
    // });
  });
})();
