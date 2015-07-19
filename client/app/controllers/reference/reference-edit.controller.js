'use strict';

angular.module('columbyApp')

.controller('ReferenceEditCtrl', function($scope, $modalInstance, dataset, reference, DatasetReferenceSrv, EmbedlySrv, ngNotify) {

  // Add received dataset from parent to this scope.
  $scope.dataset = dataset;

  $scope.reference = reference;

  // Current wizard step
  $scope.step='details';

  // Save the reference.
  $scope.update = function() {

    $scope.updateInProgress = true;

    // save reference
    DatasetReferenceSrv.update({
      id: $scope.dataset.id,
      rid: $scope.reference.id,
      reference: $scope.reference
    }, function(res){
      console.log('Reference result', res);
      if (res.id) {
        $modalInstance.close(res);
      } else {
        ngNotify.set('There was an error updating the reference. (' + response.msg + ')', 'error');
      }
    });
  };

});
