(function() {
  'use strict';

  angular
    .module('columbyApp')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $state, UserSrv, ngNotify, gettextCatalog, AuthSrv, appConstants) {

    gettextCatalog.setCurrentLanguage('nl_NL');

    ngNotify.config({
      theme: 'pure',
      position: 'top',
      duration: 5000,
      type: 'info',
      sticky: false
    });

    $rootScope.user = UserSrv.me();

    $rootScope.meta = {
      description: 'Columby - Find and discover data.'
    };

    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
      $log.debug(error);
    });

    /***
     *
     * Check permission for each state change
     *
     ***/
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      //Check if the user has the required role
      if (toState.data && toState.data.permission) {
        if (!AuthSrv.hasPermission(toState.data.permission, toParams)){
          event.preventDefault();
          $state.go('home');
          ngNotify.set('Sorry, you have no access to the requested page.', 'error');
        }
      }
    });


    // change page title based on state
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      $rootScope.pageTitle = '';
      if (toState.title) {
        $rootScope.pageTitle += toState.title;
        $rootScope.pageTitle += ' \u2014 ';
      }
      $rootScope.pageTitle += appConstants.appTitle;
    });

    $rootScope.title = "Columby";

    // Set body classes based on ui-router state change.
    $rootScope.bodyClasses = 'default';
    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
      if (toState.data && toState.data.bodyClasses) {
        $rootScope.bodyClasses = toState.data.bodyClasses;
        return;
      }
    });
  }
})();
