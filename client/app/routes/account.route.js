'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('account', {
        url: '/a/:slug',
        templateUrl: 'views/account/view.html',
        controller: 'AccountCtrl'
      })

      .state('accountEdit', {
        url: '/a/:slug/edit',
        templateUrl: 'views/account/edit.html',
        controller: 'AccountEditCtrl'
      });

  });
