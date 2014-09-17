'use strict';

angular.module('mean.collection').controller('CollectionController', ['$scope', 'Global', 'Collection',
  function($scope, Global, Collection) {
    $scope.global = Global;
    $scope.package = {
      name: 'collection'
    };
  }
]);
