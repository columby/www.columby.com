'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('signin', {
        url: '/u/signin',
        templateUrl: 'views/user/signin.html',
        controller: 'SigninCtrl'
      })

      .state('register', {
        url: '/u/register',
        templateUrl: 'views/user/register.html',
        controller: 'RegisterCtrl'
      })

      .state('settings', {
        url: '/u/settings',
        templateUrl: 'views/user/view.html',
        controller: 'UserCtrl'
      });
  });
