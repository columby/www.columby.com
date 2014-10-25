'use strict';

angular.module('columbyApp')

  .controller('MetabarCtrl', function ($rootScope, $scope) {

    $scope.showToggle = true;

    $rootScope.$on('sitenav::toggle', function() {
      $scope.showToggle = !$scope.showToggle;
    });
    

    /* ----- SCOPE FUNCTIONS ---------------------------------------------------------- */
    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function() {
      $rootScope.$broadcast('sitenav::toggle');
    };

  });
