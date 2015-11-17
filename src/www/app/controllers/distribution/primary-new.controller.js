(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('PrimaryNewCtrl', function($log,$scope, $modalInstance, distribution, primary, DistributionSrv, PrimaryService, WorkerSrv, ngNotify){

    $scope.loading = true;
    $scope.distribution = distribution;
    $scope.primary = primary;
    $scope.primary.valid = false;
    $scope.primary.jobType = null;

    // Determine the job type
    if ($scope.distribution.accessUrl){
      DistributionSrv.validateLink({url:$scope.distribution.accessUrl}, function(response){
        $scope.primary.valid = response.valid;
        $scope.primary.jobType = response.type;
        $scope.primary.jobStatus = 'draft';
        $scope.loading = false;
      });
    } else if (distribution.file_id){
      // For now we assume each valid file is CSV
      $scope.loading = false;
      $scope.primary.jobType='csv';
      $scope.primary.valid = true;
      $scope.primary.jobStatus = 'draft';
    }

    $scope.confirm = function() {
      // Save the Primary
      $log.debug('Saving primary, ', $scope.primary);
      PrimaryService.save($scope.primary, function(primary){
        $log.debug('Save result: ', primary);
        if (primary.id){
          // Send to queue
          var job = {
            type: $scope.primary.jobType,
            data: $scope.primary
          };
          WorkerSrv.add(job).then(function(jobResult){
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
            $log.debug('err', err);
            $log.debug(primary);
            ngNotify.set('There was an error sending the primary for processing...','error');
            PrimaryService.delete({id: primary.id}, function(result){
              $log.debug('result', result);
            });
          });

        } else {
          ngNotify.set('warning',null,'There was an error creating the primary source.');
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
