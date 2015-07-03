'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('account', {
        url: '/a/:slug',
        templateUrl: 'views/account/view.html',
        controller: 'AccountCtrl',
        data: {
          bodyClasses: 'page account view',
          permission: 'view account'
        }
      })

      .state('accountEdit', {
        url: '/a/:slug/edit',
        templateUrl: 'views/account/edit.html',
        controller: 'AccountEditCtrl',
        data: {
          bodyClasses: 'page account edit',
          permission: 'edit account'
        }
      });

  });
