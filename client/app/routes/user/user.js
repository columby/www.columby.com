'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signin', {
        url: '/u/signin',
        templateUrl: 'app/routes/user/partials/signin.html',
        controller: 'SigninCtrl'
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
