angular.module('columbyApp')

  .controller('EditPrimarySourceCtrl', function ($scope, $modalInstance, primary, DistributionSrv, toaster) {

    var originalprimary = primary;
    $scope.primary = primary;

    function updatePrimary(){
      DistributionSrv.update($scope.distribution, function(response){
        if (response.id){
          toaster.pop('success',null,'Datasource updated successfully');
          $modalInstance.close(response);
        } else {
          toaster.pop('danger',null,'Error updating the dataset.');
        }
      });
    }



    $scope.update = function () {

    };


    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
