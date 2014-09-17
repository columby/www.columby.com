'use strict';

angular.module('mean.accounts').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('accounts example page', {
      url: '/accounts/example',
      templateUrl: 'accounts/views/index.html'
    });
  }
]);
