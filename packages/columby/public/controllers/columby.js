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

  .controller('ColumbyLoginCtrl', function ($scope, $rootScope, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    $scope.credentials = {
      username: '',
      password: ''
    };

    // Handle passwordless login
    $scope.passwordlessLogin = function(email){
      ColumbyAuthSrv.passwordlessLogin(email).then(function(response){
        console.log(response);
      });
    };

    $scope.login = function (credentials) {
      //console.log('Controlle credentials received, sending to srv');
      ColumbyAuthSrv.login(credentials).then(function (response) {
        //console.log('login controller response: ');
        //console.log(response);
        if (response.status === 'success'){
          FlashSrv.setMessage({
              value: 'You are successfully logged in.',
              status: 'info'
          });
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
          //$scope.setCurrentUser(response.user);
        } else {
          $scope.loginerror = response.errorMessage;
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };
  })

  .controller('ColumbyRegisterCtrl', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    // Initiate the registration process (register-form)
    $scope.register = function (credentials) {
      // Get the credentials from the form
      credentials = {
        email: $scope.user.email,
        username: $scope.user.username,
        password: $scope.user.password,
        confirmPassword: $scope.user.confirmPassword
      };
      // Register at the server
      ColumbyAuthSrv.register(credentials).then(function (response) {
        console.log(response);
        // Something went wrong during registration at the server
        if (response.status === 'error') {
          $scope.registerError = response.statusMessage;
        // registration successful
        } else if (response.status === 'success'){
          // The server sent an email with the confirmation link.
          // Create a flashmessage for feedback
          FlashSrv.setMessage({
              value: 'A confirmation email has been sent. Please check your inbox for the confirmation link. ',
              status: 'info'
          });
          // Let the app know
          $rootScope.$broadcast(AUTH_EVENTS.registrationSuccess, response.user);
          // Redirect back to frontpage
          $location.path('/');
          $state.go($state.current, {}, {reload: true});
        } else {
          // Something went wrong
          $scope.registrationError = response.errorMessage;
          $rootScope.$broadcast(AUTH_EVENTS.registrationFailed);
        }
      }, function () {
        $rootScope.$broadcast(AUTH_EVENTS.registrationFailed);
      });
    };
  })

  .controller('ColumbyVerifyCtrl', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {
    var token = 12;
    ColumbyAuthSrv.verify(token).then(function(response){
      console.log(response);
      if (response.status === 'error') {
        $scope.verifyError = response.statusMessage;
      // registration successful
      } else if (response.status === 'success'){
        FlashSrv.setMessage({
          value: 'Succesfully confirmed, you are now logged in. ',
          status: 'info'
        });
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
        $location.path('/');
        $state.go($state.current, {}, {reload: true});
      }
    });
  })

  /*** Main App controller ***/
  .controller('ColumbyController', ['$rootScope','$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    //$scope.global = Global;
    $scope.package = {
      name: 'columby'
    };

    /*
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };
    */

    //console.log('columbycontroller created');
    $scope.$on('flashmessage', function(e,msg){
      $scope.flashMessage = msg;
    });

  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby','$http','FlashSrv','$location', 'ColumbyAuthSrv','AUTH_EVENTS','$state',
  function($rootScope, $scope, Global, Columby,$http,FlashSrv,$location,ColumbyAuthSrv,AUTH_EVENTS, $state) {
    $scope.controller = {
      name: 'SiteNavController'
    };
    //console.log(ColumbyAuthSrv.user());
    $scope.global = {};
    $scope.global.user = ColumbyAuthSrv.user();
    //console.log(ColumbyAuthSrv.isAuthenticated());
    $scope.global.authenticated = ColumbyAuthSrv.isAuthenticated();

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(e){
      //console.log('authentication successful');
      //console.log(ColumbyAuthSrv.user());
      $scope.global.user = ColumbyAuthSrv.user();
      $scope.global.authenticated = true;
      $location.path('/');
      $state.go($state.current, {}, {reload: true});
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

      ColumbyAuthSrv.logout().then(function(response){
        $scope.global.user = ColumbyAuthSrv.user();
        $scope.global.authenticated = false;

        FlashSrv.setMessage({
          value: 'You have been sucesfully signed out.',
          status: 'info'
        });

        $location.path('/');
        $state.go($state.current, {}, {reload: true});
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
