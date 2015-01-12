'use strict';

angular.module('columbyApp')

  .directive('accountSelector', function(){
    return {
      templateUrl: 'app/directives/accountSelector/accountSelector.html',
      restrict: 'EA',
      scope: {
        select: '&'
      },

      controller: function($scope){
        $scope.selectAccount = function(item){
          $scope.select({id: item});
        };
      }
    };
  });
