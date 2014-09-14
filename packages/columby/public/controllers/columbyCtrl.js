'use strict';

angular.module('mean.columby')

  // Check permission to view the page.
  .run(function ($rootScope) {

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
        $http.defaults.headers.common.Authorization = 'Bearer ' + token;
      }
      // Get account with token
      // account was already fetched before angular init
      $rootScope.user = {
        account: AuthSrv.user(),
        isAuthenticated: AuthSrv.isAuthenticated()
      };

      if ($rootScope.user.isAuthenticated){
        toaster.pop('success', 'Welcome', 'Welcome back ' + $rootScope.user.account.username);
      }
    }
  ])


  /***
   * Controller for the Home page
   *
   ***/
  .controller('ColumbyHomeCtrl',
    function($scope, $rootScope, $location, $state, toaster, AUTH_EVENTS, AuthSrv, DatasetSrv) {

    angular.element('body').addClass('contentLoading');
    $scope.contentLoading = true;

    DatasetSrv.query(function(response){
      $scope.datasets = response;
      $scope.contentLoading = false;
      angular.element('body').removeClass('contentLoading');
    });
  })



  /***
   * Controller for the main Site Navigation
   *
   ***/
  .controller('SiteNavController', ['$rootScope', '$scope', '$http','toaster','$location', 'AuthSrv', '$state',
    function($rootScope, $scope, $http, toaster, $location, AuthSrv, $state) {

      /* ---------- SETUP ----------------------------------------------------------------------------- */
      $scope.controller = {name: 'SiteNavController'};


      /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */
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

    }
  ])
;
