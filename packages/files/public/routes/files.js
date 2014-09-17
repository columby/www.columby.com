'use strict';

angular.module('mean.files').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('files example page', {
      url: '/files/example',
      templateUrl: 'files/views/index.html'
    });
  }
]);
