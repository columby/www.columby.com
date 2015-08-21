(function() {
  'use strict';

  angular
    .module('columbyApp')
    .directive('sidebar', function() {

      return {
        restrict: 'EA',
        templateUrl: 'views/directives/sidebar/sidebar.html',

        controller: function($rootScope,$scope){

          $scope.status = { isopen: false };

          $rootScope.$on('toggleSidebar', function(){
            $scope.status.isopen = !$scope.status.isopen;
          });
        }
      };
    });
})();
