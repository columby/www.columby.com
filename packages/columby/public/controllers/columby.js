'use strict';

angular.module('mean.columby').controller('ColumbyController', ['$rootScope','$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;
    $scope.package = {
      name: 'columby'
    };

    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;

    //$scope.showSiteNav = false;

    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      $scope.showSiteNav = false;
    });

    $scope.$on('sitenav::toggle', function(event) {
      $scope.showSiteNav = !$scope.showSiteNav;
    });

    $scope.toggleSiteNav = function(e) {
      $scope.showSiteNav = !$scope.showSiteNav;
    };

  }
]);
