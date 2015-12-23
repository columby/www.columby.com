(function() {
  'use strict';

  angular.module('columbyApp').controller('AccountCategoryCtrl', function($log,account,datasets,category,$rootScope, $scope, appConstants) {

    $scope.account = account;
    $scope.datasets = datasets;
    $scope.category = category;

  }
);
})();
