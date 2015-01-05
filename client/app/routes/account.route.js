'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('account', {
        template: '<ui-view />'
      })

      .state('account.create', {
        url: '/a/new',
        templateUrl: 'app/routes/account/partials/account.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        data: {
          editMode: true
        },
        controller: 'AccountCtrl'
      })

      .state('account.view', {
        url: '/a/:slug',
        templateUrl: 'app/routes/account/partials/view.html',
        controller: 'AccountCtrl'
      })

      .state('account.edit', {
        url: '/a/:slug/edit',
        templateUrl: 'app/routes/account/partials/edit.html',
        authorization: {
          authorizedRoles: ['authenticated']
        },
        controller: 'AccountEditCtrl'
      });

  });
