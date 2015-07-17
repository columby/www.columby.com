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

  .directive('sidebar', function() {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/sidebar/sidebar.html',

      controller: function($rootScope,$scope){

        $scope.status = { isopen: false };

        $rootScope.$on('toggleSidebar', function(){
          $scope.status.isopen = !$scope.status.isopen;
        });
      }
    };
  });
