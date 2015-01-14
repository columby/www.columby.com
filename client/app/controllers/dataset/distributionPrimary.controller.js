'use strict';

angular.module('columbyApp')

  // Controller for a new primary source modal
  .controller('DatasetPrimaryCtrl', function($scope, $modalInstance, distribution, primary, DistributionSrv, PrimaryService, WorkerSrv, toaster){

    $scope.loading = true;
    $scope.distribution = distribution;
    $scope.primary = primary;
    $scope.primary.valid = false;
    $scope.primary.jobType = null;

    if ($scope.distribution.accessUrl){
      DistributionSrv.validateLink({url:$scope.distribution.accessUrl}, function(response){
        $scope.primary.valid = response.valid;
        $scope.primary.jobType = response.type;
        $scope.primary.jobStatus = 'draft';
        $scope.loading = false;
      });
    }

    $scope.confirm = function() {
      // Save the Primary
      console.log('Saving primary, ', $scope.primary);
      PrimaryService.save($scope.primary, function(primary){
        console.log('Save result: ', primary);
        if (primary.id){
          // Send to queue
          var job = {
            type: $scope.primary.jobType,
            data: {
              title: $scope.primary.dataset.title + ' - ID:' + $scope.primary.dataset.shortid,
              ID: $scope.primary.dataset.shortid
            }
          };
          WorkerSrv.add(job).then(function(jobResult){
            console.log('Job result: ', jobResult);
            if (jobResult.id){
              // update primary job status
              primary.jobStatus='queued';
              primary.$update(function(e){
                console.log('updated');
                console.log(e);
              });
            }
            //
            // All done, close modal
            $modalInstance.close(primary);
          }, function(err){
            console.log('err', err);
            console.log(primary);
            toaster.pop('error', null,'There was an error sending the primary for processing...');
            PrimaryService.delete({id: primary.id}, function(result){
              console.log('result', result);
            });
          });

        } else {
          toaster.pop('warning',null,'There was an error creating the primary source.');
        }
      });
      // Send to Worker Queue

      // Close when ready

    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

// Controller for a new primary source modal
  .controller('DatasetPrimaryEditCtrl', function($scope, $modalInstance, primary){

    $scope.primary = primary;

    $scope.confirm = function(){
      $modalInstance.close($scope.primary);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

;
