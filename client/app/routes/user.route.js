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
          permission: 'signin user'
        }
      })

      .state('verify', {
        url: '/u/verify',
        templateUrl: 'views/user/verify.html',
        controller: 'UserVerifyCtrl',
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
          permission: 'register user'
        }
      })

      .state('userEdit', {
        url: '/u/:slug/edit',
        templateUrl: 'views/user/edit.html',
        controller: 'UserEditCtrl',
        data: {
          bodyClasses: 'page user edit',
          permission: 'edit user'
        }
      })

  });
