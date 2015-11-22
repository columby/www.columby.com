(function() {
  'use strict';

  angular.module('columbyApp')

  .controller('PrimaryEditCtrl', function($log, $scope, $modalInstance, primary, PrimarySrv, WorkerSrv, ngNotify){
    $log.debug('primary edit controller', primary);
    $scope.primary = primary;

    $scope.update = function(){
      console.log('Updating primary source');
      PrimarySrv.update($scope.primary.id, $scope.primary, function(primary) {
        $log.debug('Primary result: ', primary);
        if (primary.id){
          // Send to queue
          var job = {
            type: $scope.primary.jobType,
            data: $scope.primary
          };
          $log.debug('Sending job ', job);
          WorkerSrv.add(job).then(function(job){
            $log.debug('Job result: ', job);
            if (job.id){
              // update primary job status
              $scope.primary.jobStatus='queued';
              PrimarySrv.update($scope.primary.id, $scope.primary, function(primary){
                $log.debug('updated', primary);
                if (primary.id){
                  $scope.primary = primary;
                }
              });
            }
            //
            // All done, close modal
            $modalInstance.close($scope.primary);
          }, function(err){
            $log.debug('err', err);
            $log.debug(primary);
            ngNotify.set('There was an error sending the primary for processing...','error');
            // PrimarySrv.delete({id: primary.id}, function(result){
            //   $log.debug('result', result);
            // });
          });

        } else {
          ngNotify.set('warning',null,'There was an error creating the primary source.');
        }
        //$modalInstance.close($scope.primary);
      });
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
})();
