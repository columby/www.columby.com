'use strict';

angular.module('columbyApp')
  .controller('DatasetDeleteCtrl',
  function ($scope, $modalInstance, dataset, DatasetSrv) {

    $scope.confirm = function(){
      console.log('Delete controller. ');
      console.log(dataset.id);
      DatasetSrv.delete({id: dataset.id}, function(result){
        console.log(result);
        $modalInstance.close(true);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
