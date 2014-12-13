'use strict';

angular.module('columbyApp')

  .directive('distributionPopup', function($rootScope, EmbedlySrv, DatasetReferenceSrv, ngDialog){
    return {
      templateUrl: 'app/directives/distributionPopup/distributionPopup.html',
      restrict: 'EA',
      scope: {
        dataset: '='
      },

      controller: function($scope){

        $scope.initNewDistribution = function() {

          $scope.newDistribution = {};
          ngDialog.open({
            template: 'app/directives/distributionPopup/distributionPopupContent.html',
            className: 'ngdialog-theme-default fullscreenDialog',
            scope: $scope
          });
        };

        $scope.checkLink = function(){
          // validate
          $scope.newDistribution.validationMessage = 'The link was validated!';
          $scope.newDistribution.distributionType = 'link';
          $scope.newDistribution.valid = true;
        };

        $scope.createDistribution = function() {
          //console.log('Creating ditribution');
          // validate link
          if ($scope.newDistribution){
            if ($scope.newDistribution.valid) {
              // add link to model
              if (!$scope.dataset.hasOwnProperty('distributions')) {
                $scope.dataset.distributions = [];
              }

              var distribution = {
                // Columby Stuff
                uploader          : $rootScope.user.id,
                distributionType  : $scope.newDistribution.distributionType,
                publicationStatus : 'public',
                // DCAT stuff
                accessUrl         : $scope.newDistribution.link
              };
              //console.log('attaching distribution', distribution);

              DatasetDistributionSrv.save({
                  id:$scope.dataset.id,
                  distribution: distribution}, function(res){
                  //console.log('res', res);
                  if (res.status === 'success'){
                    $scope.dataset.distributions.push(res.distribution);
                    toaster.pop('success', 'Updated', 'New dataset added.');
                    ngDialog.closeAll();
                    $scope.newDistribution = null;
                  } else {
                    toaster.pop('danger', 'Error', 'Something went wrong.');
                  }
                }
              );
            }
          } else {
            toaster.pop('danger', 'Error', 'No new distribution attached');
          }
        };

      }
    };
  });
