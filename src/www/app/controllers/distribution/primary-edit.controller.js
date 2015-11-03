(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('PrimaryEditCtrl', function($scope, $modalInstance, primary){

    $scope.primary = primary;

    $scope.confirm = function(){
      $modalInstance.close($scope.primary);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})();
