'use strict';

angular.module('mean.accounts').config(['$stateProvider',
  function($stateProvider) {

    $stateProvider

    .state('account', {
      template: '<ui-view />'
    })

    .state('account.create', {
      url: '/a/new',
      templateUrl: 'accounts/views/view.html',
      authorization: {
        authorizedRoles: ['authenticated']
      },
      data: {
        editMode: true
      }
    })
    
    .state('account.view', {
      url: '/a/:slug',
      templateUrl: 'accounts/views/view.html'
    })

    ;
  }
]);
