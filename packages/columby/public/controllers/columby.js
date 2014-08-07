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
  .run(function ($rootScope, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {
    $rootScope.$on('$stateChangeStart', function (event, next) {
      $rootScope.$broadcast('sitenav::toggle', 'close');
      if (next.hasOwnProperty('data')) {
        if (next.data.hasOwnProperty('authorizedRoles')) {
          var authorizedRoles = next.data.authorizedRoles;
          if (!ColumbyAuthSrv.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            if (ColumbyAuthSrv.isAuthenticated()) {
              // user is not allowed
              console.log('not autheorized');
              $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            } else {
              console.log('not authenticated');
              // user is not logged in
              $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
          }
        }
      }
    });

    $rootScope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
      //console.log('Checking for message');
      //FlashSrv.setMessage('This is a new message');
      var msg = FlashSrv.getMessage();

      if (msg !== '') {
        //console.log('message received: ' + msg);
        $rootScope.$broadcast('flashmessage', msg);
      }
    });
  })

  .controller('ColumbyLoginCtrl', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    console.log('ColumbyLoginController loaded.');
    console.log('user', ColumbyAuthSrv.user());
    // Initialization
    $scope.loginInProgress = false;
    $scope.credentials = {
      username: '',
      email: '',
      password: ''
    };

    // Check if a request is a login token request
    var params = $location.search();
    if (params.token) {
      $scope.verifyInProgress = true;
      ColumbyAuthSrv.passwordlessVerify(params.token).then(function(response){
        $scope.verifyInProgress = false;
        if (response.status === 'success'){
          // Let the app know
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
          FlashSrv.setMessage({
            value: 'You have succesfully signed in.',
            status: 'info'
          });
          // Redirect back to frontpage
          $state.go('home', {}, {reload: true});
        } else {
          $scope.verifyError = response.statusMessage;
        }
      });
    }

    // Handle passwordless login
    $scope.passwordlessLogin = function(){
      $scope.loginInProgress = true;
      var credentials = $scope.credentials;
      console.log('passwordlesslogin');
      console.log(credentials);

      ColumbyAuthSrv.passwordlessLogin(credentials).then(function(response){
        $scope.loginInProgress = false;
        console.log(response);
        if (response.status === 'success') {
          $scope.signinSuccess = true;
          FlashSrv.setMessage({
            value: 'You have been successfully signed in.',
            status: 'info'
          });
          console.log('user', ColumbyAuthSrv.user());
        } else if (response.error === 'User not found') {
          $scope.loginError = 'The email address ' + credentials.email + ' does not exist. Would you like to register for a new account?';
          $scope.showRegister = true;
          $scope.newuser={
            email: $scope.credentials.email,
            username: $scope.credentials.email.replace(/@.*$/,'')
          };
          //$scope.credentials.email = null;
        }
      });
    };

    $scope.passwordlessRegister = function(){
      var newuser = $scope.newuser;
      console.log('passwordlessRegister', newuser);

      ColumbyAuthSrv.passwordlessRegister(newuser).then(function(response){
        console.log(response);
        console.log('user', ColumbyAuthSrv.user());
        if (response.error === 'Error registering user.') {
          $scope.registerError = response.error;
          //$scope.showRegister = true;
          //$scope.credentials.username = $scope.credentials.email.replace(/@.*$/,'');
        }
      });
    };
  })


  /*** Main App controller ***/
  .controller('ColumbyController', ['$rootScope','$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    //$scope.global = Global;
    $scope.package = {
      name: 'columby'
    };

    //console.log('columbycontroller created');
    $scope.$on('flashmessage', function(e,msg){
      $scope.flashMessage = msg;
    });

  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby','$http','FlashSrv','$location', 'ColumbyAuthSrv','AUTH_EVENTS','$state',
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
        $state.go('home', {}, {reload: true});
      });
    };
  }
]);



angular.module('mean.columby').controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
  //$scope.global = Global;
    console.log('Metabar controller loaded');

    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);
