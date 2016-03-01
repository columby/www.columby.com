(function() {
  'use strict';

  angular.module('columbyApp')
  .controller('PrimaryNewCtrl', function($log,$scope, $modalInstance, distribution, primary, DistributionSrv, PrimarySrv, WorkerSrv, ngNotify){

    // Init
    $scope.loading = true;
    $scope.distribution = distribution;
    $scope.primary = primary;
    // Primary status object
    $scope.primaryStatus = {
      valid: false,
      jobType: null,
      validatingLink: false
    };

    if ($scope.distribution.accessUrl) {
      $scope.primaryStatus.jobType='arcgis';
      $scope.primary.jobType='arcgis';
    } else if ($scope.distribution.file_id) {
      $scope.primaryStatus.jobType='csv';
      $scope.primary.jobType='arcgis';
    } else {
      $scope.primaryStatus.jobType = 'undefined';
      $scope.primary.jobType='arcgis';
    }

    // Validate the accessUrl if provided.
    if ($scope.primaryStatus.jobType === 'arcgis'){
      $scope.primaryStatus.validatingLink = true;
      DistributionSrv.validateLink({url:$scope.distribution.accessUrl}, function(response){
        $scope.primaryStatus.valid = response.valid;
        $scope.primaryStatus.jobStatus = 'draft';
        $scope.primaryStatus.validatingLink = false;
      });
    } else if ($scope.primaryStatus.jobType === 'csv'){
      // For now we assume each valid file is CSV
      $scope.primaryStatus.valid = true;
      $scope.primaryStatus.jobStatus = 'draft';
    }

    $scope.confirm = function() {
      // Save the Primary
      $log.debug('Saving new primary source', $scope.primary);
      PrimarySrv.save($scope.primary, function(primary){
        $log.debug('Save result: ' + primary.id);
        if (primary.id) {
          // Send to Job queue
          var job = {
            type: $scope.primary.jobType,
            data: $scope.primary
          };
          $log.debug('The primary source is created, sending the source for processing to the Job Worker. ');
          WorkerSrv.add(job).then(function(jobResult) {
            $log.debug('Job result: ', jobResult);
            if (jobResult.id){
              // update primary job status
              primary.jobStatus='queued';
              primary.$update(function(e){
                $log.debug('updated');
                $log.debug(e);
              });
            }
            //
            // All done, close modal
            $modalInstance.close(primary);
          }, function(err){
            $log.debug('There was an error sending the Job for this Primary. ', err);
            ngNotify.set('There was an error sending the primary for processing...','error');
            $log.debug('Deleting the primary source. ');
            PrimarySrv.delete({id: primary.id}, function(result){
              $log.debug('result', result);
            });
          });
        } else {
          ngNotify.set('There was an error creating the primary source.', 'error');
        }
      });
      // Send to Worker Queue

      // Close when ready

    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})();
