(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('DatasetDeleteCtrl',
  function ($scope, $modalInstance, dataset, DatasetSrv) {

    // Handle confirm delete button click
    $scope.confirm = function() {
      DatasetSrv.delete({id: dataset.id}, function(result){
        $modalInstance.close(result);
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})();
