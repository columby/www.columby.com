'use strict';

angular.module('mean.dataset').controller('DatasetController', ['$scope', 'Global', 'Dataset',
  function($scope, Global, Dataset) {
    $scope.global = Global;
    $scope.package = {
      name: 'dataset'
    };
  }
]);
