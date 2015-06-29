/***
 *
 * Main navigation component (directive)
 *
 * The main navigation uses the Bootstrap dropdown directive to make the navication visible or not.
 * The CSS file is located in the general styles folder (styles/components/navbar.less)
 *
 ***/

'use strict';

angular.module('columbyApp')

  .directive('navbar', function() {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/navbar/navbar.html',

      controller: function(){
        // $scope.status = {
        //   isopen: false
        // };

        // $scope.toggled = function(open) {
        //   // $log.log('Dropdown is now: ', open);
        // };

        // $scope.toggleDropdown = function($event) {
        //   $event.preventDefault();
        //   $event.stopPropagation();
        //   $scope.status.isopen = !$scope.status.isopen;
        // };

        // $scope.isActive = function(route) {
        //   return route === $location.path();
        // };

      }
    };
  });
