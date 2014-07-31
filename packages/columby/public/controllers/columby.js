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

    // For every state change, disable the sitenav panel
    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.$broadcast('sitenav::toggle');
    });

    // respond to an event from rootscope to toggle the sitenav panel. Most likely this comes from the metabar icon.
    $scope.$on('sitenav::toggle', function(event) {
      $scope.showSiteNav = !$scope.showSiteNav;
      console.log($scope.showSiteNav);
      // change body class
      if ($scope.showSiteNav === true) {
        console.log('sitenav open');
        angular.element('body').addClass('sitenav-open');
      } else {
        console.log('sitenav closed');
        angular.element('body').removeClass('sitenav-open');
      }
    });
    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);

angular.module('mean.columby').controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;
    console.log('Metabar controller loaded');

    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);
