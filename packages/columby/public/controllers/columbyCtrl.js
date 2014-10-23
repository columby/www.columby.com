'use strict';

angular.module('mean.columby')

  // Check permission to view the page.
  .run(function ($rootScope, configuration) {

    // Add configuration to the rootScope
    $rootScope.configuration = configuration;

    $rootScope.$on('$stateChangeStart', function (event, next) {
      angular.element('body').addClass('isLoading');
      angular.element('body').removeClass('editorSidebarOpen');
    });

    $rootScope.$on('$stateChangeSuccess', function (event, next) {
      angular.element('body').removeClass('isLoading');
    });
  })


  /***
   * Main application controller
   *
   ***/
  .controller('ColumbyCtrl', [
    '$window','$rootScope','$scope','$timeout','$http','toaster','Columby','AuthSrv',
    function($window,$rootScope, $scope, $timeout, $http, toaster, Columby, AuthSrv) {

      /* ----- SETUP -----------------------------------------------------------------*/
      // Add console object to window for IE9
      window.console = window.console || {};
      window.console.log = window.console.log || function() {};


      /* ----- FUNCTIONS -----------------------------------------------------------------*/


      /* ----- EVENTS ---------------------------------------------------------*/


      /* ----- INIT ---------------------------------------------------------*/
      // Initialize persistent logged in user
      // get token from localstorage and put it in header
      if ($window.localStorage.getItem('auth_token')) {
        var token = angular.fromJson($window.localStorage.getItem('auth_token'));
        AuthSrv.setColumbyToken(token);
      }

      // Get account with token
      $rootScope.user = AuthSrv.user();
      $rootScope.user.isAuthenticated = AuthSrv.isAuthenticated();
      $rootScope.user.selectedAccount = AuthSrv.selectedAccount();

      if (AuthSrv.isAuthenticated){
        console.log('Welcome back ' + AuthSrv.user().email);
        toaster.pop('success', null, 'Welcome back ' + AuthSrv.user.email);
      }
    }
  ])


  /***
   * Controller for the Home page
   *
   ***/
  .controller('ColumbyHomeCtrl', ['$rootScope', '$scope', 'toaster', 'DatasetSrv', 'SearchSrv',
    function($rootScope, $scope, toaster, DatasetSrv, SearchSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading = true;
    $scope.search = '';

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function listDatasets() {
      DatasetSrv.query(function(response){
        $scope.datasets = response;
        $scope.contentLoading = false;
      });
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.search = function(){
      console.log('search: ', $scope.search.searchTerm);
      SearchSrv.query({
        index: 'datasets',
        size: 50,
        body: {
          'query': {
            'match': {
              '_all': String($scope.search.searchTerm)
            }
          }
        }
      }).then(function (response) {
        console.log('re', response);
        $scope.search.hits = response.hits.hits;
      });
    };

    /* ---------- INIT ---------------------------------------------------------------------------- */
    listDatasets();

  }])



  /***
   * Controller for the main Site Navigation
   *
   ***/
  .controller('SiteNavController', ['$rootScope', '$scope', '$http','toaster','$location', 'AuthSrv', '$state',
    function($rootScope, $scope, $http, toaster, $location, AuthSrv, $state) {

      /* ---------- SETUP ----------------------------------------------------------------------------- */


      /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */

      // State change
      $rootScope.$on('$stateChangeStart', function (event, next) {
        $rootScope.$broadcast('sitenav::toggle', 'close');
      });

      // Account updated
      $scope.$on('account::updated', function(e){
        //$scope.global.user = AuthSrv.user();
      });

      // Toggle sidebar
      $scope.$on('sitenav::toggle', function(event, action) {
        switch (action){
          case 'close':
            $scope.showSiteNav = false;
            angular.element('body').removeClass('sitenav-open');
            break;
          case 'open':
            $scope.showSiteNav = true;
            angular.element('body').addClass('sitenav-open');
            break;
          default:
          case 'toggle':
            $scope.showSiteNav = !$scope.showSiteNav;
            if ($scope.showSiteNav === true) {
              angular.element('body').addClass('sitenav-open');
            } else {
              angular.element('body').removeClass('sitenav-open');
            }
          }
      });


      /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
      // function to send a message to the rootscope to toggle the sitenav
      $scope.toggleSiteNav = function(e) {
        $rootScope.$broadcast('sitenav::toggle');
      };

      $scope.toggleAccountSelector = function(){
        $scope.showAccountSelector = !$scope.showAccountSelector;
      };

      $scope.changeSelectedAccount = function(index) {
        $rootScope.user.selectedAccount = index;
        $scope.toggleAccountSelector();
      };

    }
  ])
;
