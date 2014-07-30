'use strict';

angular.module('mean.columby').controller('ColumbyController', ['$scope', 'Global', 'Columby',
  function($scope, Global, Columby) {
    $scope.global = Global;
    $scope.package = {
      name: 'columby'
    };
  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$scope', 'Global', 'Columby',
  function($scope, Global, Columby) {
    $scope.global = Global;

    $scope.showSiteNav = false;

    $scope.toggleSiteNav = function(e) {
      $scope.showSiteNav = !$scope.showSiteNav;
    };

  }
]);
