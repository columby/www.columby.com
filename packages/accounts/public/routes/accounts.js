'use strict';

angular.module('mean.accounts').config(['$stateProvider',
  function($stateProvider) {

    $stateProvider

    .state('account', {
      template: '<ui-view />'
    })

    .state('account.view', {
      url: '/:slug',
      templateUrl: 'accounts/views/view.html'
    })

    ;

  }
]);
