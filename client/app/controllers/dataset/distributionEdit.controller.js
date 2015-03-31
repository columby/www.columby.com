'use strict';

angular.module('columbyApp')
  .controller('DistributionEditCtrl',
  function ($scope, $modalInstance, distribution, DistributionSrv, toaster) {

    var originalDistribution = distribution;
    $scope.distribution = distribution;

    function updateDistribution(){
      DistributionSrv.update($scope.distribution, function(response){
        if (response.id){
          toaster.pop('success',null,'Datasource updated successfully');
          $modalInstance.close(response);
        } else {
          toaster.pop('danger',null,'Error updating the dataset.');
        }
      });
    }

    function checkValidity(){
      // validate if we can read the source
      $scope.distribution.validation = {
        inProgress: true,
        valid: false,
        result: null
      };

      if ($scope.distribution.type === 'remoteService') {
        DistributionSrv.validateLink({url: $scope.distribution.accessUrl}, function (response) {
          console.log(response);
          $scope.distribution.validation = {
            status: 'done',
            result: response
          };
          $scope.distribution.valid = response.valid;
          // TODO: what mediatype for a link?
          $scope.distribution.mediaType = 'link';
          // TODO: Wat format for a link?
          $scope.distribution.format = 'link';
          toaster.pop('info',null,'Validation result: ' + response.valid);

          return response;
        });
      }
    }


    $scope.update = function () {
      if (originalDistribution.accessUrl !== $scope.distribution.accessUrl){
        console.log('Url changed: ', $scope.distribution.accessUrl);

        updateDistribution();
      } else {
        updateDistribution();
      }

    };

    /**
     *
     */
    $scope.checkValidity = function(){
      checkValidity();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
