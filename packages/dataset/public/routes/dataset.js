'use strict';

angular.module('mean.dataset').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('dataset example page', {
      url: '/dataset/example',
      templateUrl: 'dataset/views/index.html'
    });
  }
]);
