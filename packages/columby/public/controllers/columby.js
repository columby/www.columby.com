'use strict';


angular.module('mean.columby')

  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })

  .controller('ColumbyLoginCrl', function ($scope, $rootScope, AUTH_EVENTS, ColumbyAuthSrv) {

    $scope.credentials = {
      username: '',
      password: ''
    };

    $scope.login = function (credentials) {
      console.log('Controlle credentials received, sending to srv');
      ColumbyAuthSrv.login(credentials).then(function (response) {
        console.log('login controller response: ');
        console.log(response);
        if (response.status === 'success'){
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

  /*** Main App controller ***/
  .controller('ColumbyController', ['$rootScope','$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    //$scope.global = Global;
    $scope.package = {
      name: 'columby'
    };

    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby','$http','FlashSrv','$location', 'ColumbyAuthSrv','AUTH_EVENTS',
  function($rootScope, $scope, Global, Columby,$http,FlashSrv,$location,ColumbyAuthSrv,AUTH_EVENTS) {
    $scope.controller = {
      name: 'SiteNavController'
    };
    console.log(ColumbyAuthSrv.user());
    $scope.global = {};
    $scope.global.user = ColumbyAuthSrv.user();
    console.log(ColumbyAuthSrv.isAuthenticated());
    $scope.global.authenticated = ColumbyAuthSrv.isAuthenticated();

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(e){
      console.log('authentication successful');
      //console.log(ColumbyAuthSrv.user());
      $scope.global.user = ColumbyAuthSrv.user();
      $scope.global.authenticated = true;
      FlashSrv.setMessage('loginSuccess!');
      $location.path('/');

    });

    //console.log(Global);
    // For every state change, disable the sitenav panel
    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.$broadcast('sitenav::toggle', 'close');
    });

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
      console.log('statechangesuccess');
      FlashSrv.getMessage(function(response){
        console.log('flash: ');
        console.log(response);
      });
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
      console.log('logout');
      ColumbyAuthSrv.logout().then(function(response){
        console.log(response);
        $scope.global.user = ColumbyAuthSrv.user();
        $scope.global.authenticated = ColumbyAuthSrv.isAuthenticated();
        FlashSrv.setMessage('You have been sucesfully signed out.');
        $rootScope.$broadcast('sitenav::toggle', 'close');
        $location.path('/');
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
