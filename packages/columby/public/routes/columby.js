'use strict';

angular.module('mean.columby').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('columby example page', {
      url: '/columby/example',
      templateUrl: 'columby/views/index.html'
    });
  }
]);
