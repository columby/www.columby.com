'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('signin', {
        url: '/u/signin',
        templateUrl: 'views/user/signin.html',
        controller: 'SigninCtrl',
        data: {
          bodyClasses: 'page user signin',
          permission: 'signin existing user'
        }
      })

      .state('verigy', {
        url: '/u/verify',
        templateUrl: 'views/user/verify.html',
        controller: 'SigninCtrl',
        data: {
          bodyClasses: 'page user verify',
          permission: 'verify user login'
        }
      })

      .state('register', {
        url: '/u/register',
        templateUrl: 'views/user/register.html',
        controller: 'RegisterCtrl',
        data: {
          bodyClasses: 'page user register',
          permission: 'register new user'
        }
      })

      .state('settings', {
        url: '/u/settings',
        templateUrl: 'views/user/settings.html',
        controller: 'UserCtrl',
        data: {
          bodyClasses: 'page user settings',
          permission: 'edit user settings'
        }
      });
  });
