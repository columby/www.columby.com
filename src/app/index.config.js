(function () {
  'use strict'

  angular.module('columbyApp').config (function ($logProvider, $locationProvider, $urlRouterProvider, $authProvider, appConstants) {
    // Enable log
    $logProvider.debugEnabled(appConstants.debug)

    /* **
     * Use the HTML5 History API
     * For any unmatched url, redirect to /
     * **/
    $locationProvider.html5Mode(true).hashPrefix('!')
    $urlRouterProvider.otherwise('/')

    /* **
     * Authentication configuration.
     *   Satellizer settings
     * **/
    // Setup token name
    $authProvider.tokenName = 'token'
    $authProvider.tokenPrefix = 'columby'
    $authProvider.withCredentials = false
    // Setup Google authentication provider
    $authProvider.google({
      url: appConstants.apiRoot + '/v2/auth/google',
      clientId: '313936519511-lklf0npbiafkj3iregop6cle0n8hrpd9.apps.googleusercontent.com',
      scope: ['profile', 'email'],
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      requiredUrlParams: ['scope'],
      optionalUrlParams: ['display']
    })
  })
})()
