(function () {
  'use strict';

  angular.module('columbyApp').run(function ($log, $rootScope, $state, UserSrv, ngNotify, gettextCatalog, AuthSrv, appConstants, auth, store, jwtHelper) {

    $rootScope.config = appConstants;
    
    // Auth0 authentication events
    auth.hookEvents();

    // Set up internationalisation
    gettextCatalog.setCurrentLanguage('nl_NL');

    // Notification settings
    ngNotify.config({
      theme: 'pure',
      position: 'bottom',
      duration: 3000,
      type: 'info',
      sticky: false
    });

    // User was already fetched, set it in the user service
    // UserSrv.setUser(window.user);

    // SEO main configuration
    $rootScope.meta = {
      description: 'Columby - Find and discover data.'
    };

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      $log.debug(error);
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

    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      $rootScope.pageTitle = '';
      if (toState.title) {
        $rootScope.pageTitle += toState.title;
        $rootScope.pageTitle += ' \u2014 ';
      }
      $rootScope.pageTitle += appConstants.appTitle;
    });

    $rootScope.title = 'Columby';

    // Set body classes based on ui-router state change.
    $rootScope.bodyClasses = 'default';
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
      if (toState.data && toState.data.bodyClasses) {
        $rootScope.bodyClasses = toState.data.bodyClasses;
        return;
      }
    });
  });
})();
