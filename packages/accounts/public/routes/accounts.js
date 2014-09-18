'use strict';

angular.module('mean.accounts').config(['$stateProvider',
  function($stateProvider) {

    $stateProvider

    .state('account', {
      template: '<ui-view />'
    })

    .state('account.view', {
      url: '/a/:slug',
      templateUrl: 'accounts/views/view.html'
    })

    .state('account.create', {
      url: '/new/a?userId',
      templateUrl: 'accounts/views/view.html',
      authorization: {
        authorizedRoles: ['authenticated']
      },
      data: {
        editMode: true
      }
    })

    ;
  }
]);
