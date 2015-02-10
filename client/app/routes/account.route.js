'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('account', {
        template: '<div ui-view></div>'
      })

      // .state('account.create', {
      //   url: '/a/new',
      //   templateUrl: 'app/routes/account/partials/account.html',
      //   authorization: {
      //     authorizedRoles: ['authenticated']
      //   },
      //   data: {
      //     editMode: true
      //   },
      //   controller: 'AccountCtrl'
      // })

      .state('account.view', {
        url: '/a/:slug',
        templateUrl: 'views/account/view.html',
        controller: 'AccountCtrl'
      })

      .state('account.edit', {
        url: '/a/:slug/edit',
        templateUrl: 'views/account/edit.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        controller: 'AccountEditCtrl'
      });

  });
