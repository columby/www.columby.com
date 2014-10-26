'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signin', {
        url: '/u/signin',
        templateUrl: 'app/routes/signin/signin.html',
        controller: 'SigninCtrl'
      });
  });
