'use strict';

angular.module('mean.columby')

  // Define authentication events
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  // Define user roles
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    authenticated: 'authenticated',
    guest: 'guest'
  })


  // Check permission to view the page.
  .run(function ($rootScope, AUTH_EVENTS, $state, ColumbyAuthSrv, FlashSrv) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      console.log('statechange start');
      // Always close the sitenav bar
      $rootScope.$broadcast('sitenav::toggle', 'close');

      // Check if there is authorization data attached to the route
      if (next.hasOwnProperty('authorization')) {
        console.log(next.authorization);
        // Check Authentication status needed
        if (next.authorization.hasOwnProperty('anonymousOnly')) {
          if (ColumbyAuthSrv.isAuthenticated()){
            event.preventDefault();
            // Checking for Anonymous access only.2
            console.log('Anonymous users only!');
            FlashSrv.setMessage({
              value: 'You are already logged in.',
              status: 'info'
            });
            // Redirect back to account page
            $state.go('me');
          }
        }
        // Check which roles is/are required
        else if (next.authorization.hasOwnProperty('authorizedRoles')) {
          var authorizedRoles = next.authorization.authorizedRoles;
          console.log('users with the following roles only! ', authorizedRoles);
          console.log(ColumbyAuthSrv.isAuthorized(authorizedRoles));
          // Check if user has the required role
          if (!ColumbyAuthSrv.isAuthorized(authorizedRoles)) {

            event.preventDefault();
            FlashSrv.setMessage({
              value: 'You are not authorized to access the requested page',
              status: 'danger'
            });
            //If no previous state, go to home
            //$state.go('home');
          }
        }
      }
    });
  })


  /***
   * Main application controller
   *
   ***/
  .controller('ColumbyController', ['$rootScope','$scope', '$timeout', 'Global', 'Columby',
    function($rootScope, $scope, $timeout, Global, Columby) {


      // Respond to flash messages
      $scope.$on('flashMessage::newMessage', function(e,msg){
        $scope.flashMessage = msg;
        $timeout(closeMessage, 2000);
      });

      $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
        $scope.flashMessage = null;
      });

      function closeMessage(){
        $scope.flashMessage = null;
      }
    }
  ])


  /***
   * Controller for the Home page
   *
   ***/
  .controller('ColumbyHomeCtrl', function($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv, DatasetsSrv) {

    DatasetsSrv.index().then(function(response){
      $scope.datasets = response;
    });
  })



  /***
   * Controller for the main Site Navigation
   *
   ***/
  .controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby','$http','FlashSrv','$location', 'ColumbyAuthSrv','AUTH_EVENTS','$state',
    function($rootScope, $scope, Global, Columby,$http,FlashSrv,$location,ColumbyAuthSrv,AUTH_EVENTS, $state) {

      //Initialization
      $scope.controller = {name: 'SiteNavController'};
      $scope.global = {};
      $scope.global.user = ColumbyAuthSrv.user();
      $scope.global.authenticated = ColumbyAuthSrv.isAuthenticated();

      // respond to user events
      $scope.$on(AUTH_EVENTS.loginSuccess, function(e){
        $scope.global.user = ColumbyAuthSrv.user();
        $scope.global.authenticated = true;
        console.log('Toggle user', $scope.global.user);
      });
      $scope.$on(AUTH_EVENTS.logoutSuccess, function(e){
        $scope.global.user = ColumbyAuthSrv.user();
        $scope.global.authenticated = false;
        console.log('Toggle user', $scope.global.user);
      });

      // respond to an event from rootscope to toggle the sitenav panel. Most likely this comes from the metabar icon.
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

      // function to send a message to the rootscope to toggle the sitenav
      $scope.toggleSiteNav = function(e) {
        $rootScope.$broadcast('sitenav::toggle');
      };

      $scope.logout = function(){
        // initiate logout
        ColumbyAuthSrv.logout().then(function(response){
          // UI feedback
          FlashSrv.setMessage({
            value: 'You have been sucesfully signed out.',
            status: 'info'
          });
          $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
          // redirect back to home
          $state.go('home');
        });
      };
    }
  ])


  /***
   * Controller for the metabar
   *
   ***/
  .controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby',
    function($rootScope, $scope, Global, Columby) {
      //$scope.global = Global;
      console.log('Metabar controller loaded');

      // Send a message to the rootscope to toggle the sitenav
      $scope.toggleSiteNav = function(e) {
        $rootScope.$broadcast('sitenav::toggle');
      };
    }
  ])

;
