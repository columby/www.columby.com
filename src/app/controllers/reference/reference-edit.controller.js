(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('ReferenceEditCtrl', function($log, $scope, $modalInstance, dataset, reference, ReferenceSrv, EmbedlySrv, ngNotify) {

  // Add received dataset from parent to this scope.
  $scope.dataset = dataset;

  $scope.reference = reference;

  // Current wizard step
  $scope.step='details';

  // Save the reference.
  $scope.update = function() {

    $scope.updateInProgress = true;

    // save reference
    ReferenceSrv.update($scope.reference.id, $scope.reference, function(res){
      $log.debug('Reference result', res);
      if (res.id) {
        $modalInstance.close(res);
      } else {
        ngNotify.set('There was an error updating the reference. (' + res.msg + ')', 'error');
      }
    });
  };

});
})();
