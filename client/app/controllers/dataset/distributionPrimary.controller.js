angular.module('columbyApp')

  // Controller for a new primary source modal
  .controller('DatasetPrimaryCtrl', function($scope, $modalInstance, distribution, primary){

    $scope.primary = primary;
    $scope.distribution = distribution;

    console.log(distribution);
    console.log(primary);

    $scope.confirm = function(){
      $modalInstance.close($scope.primary)
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

// Controller for a new primary source modal
  .controller('DatasetPrimaryEditCtrl', function($scope, $modalInstance, primary){

    $scope.primary = primary;

    $scope.confirm = function(){
      $modalInstance.close($scope.primary)
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

;
