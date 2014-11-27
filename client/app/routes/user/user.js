'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signin', {
        url: '/u/signin',
        templateUrl: 'app/routes/user/partials/signin.html',
        controller: 'SigninCtrl'
      })

      .state('register', {
        url: '/u/register',
        templateUrl: 'app/routes/user/partials/register.html',
        controller: 'RegisterCtrl'
      })

      // Edit user settings
      .state('settings', {
        url:'/u/settings',
        templateUrl: 'app/routes/user/partials/view.html',
        authorization: {
          authorizedRoles: ['authenticated'],
        },
        controller: 'UserCtrl'
      });
  });
