'use strict';

angular.module('columbyApp')

  .directive('navbar', function() {

    return {
      restrict: 'EA',
      scope: {
        select: '&'
      },
      templateUrl: 'app/directives/navbar/navbar.html',

      controller: function($scope, $log, $location){
        $scope.items = [
          'The first choice!',
          'And another choice for you.',
          'but wait! A third!'
        ];

        $scope.status = {
          isopen: false
        };

        $scope.toggled = function(open) {
          $log.log('Dropdown is now: ', open);
        };

        $scope.toggleDropdown = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.status.isopen = !$scope.status.isopen;
        };

        $scope.isActive = function(route) {
          return route === $location.path();
        };

      }
    };
  });
