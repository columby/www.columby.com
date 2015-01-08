'use strict';

angular.module('columbyApp')


  .controller('ReferenceNewCtrl', function($log, $scope, $modalInstance, dataset, DatasetReferenceSrv, EmbedlySrv) {
    $scope.checkReferenceLink = function(link){

      $scope.dataset = dataset;

      $scope.reference = {
        link   : link,
        valid  : false,
        error  : null,
        result : null
      };

      $scope.reference.checkingLink = true;

      EmbedlySrv.extract($scope.reference.link)
        .then(function(result){
          //console.log(result);
          $scope.reference = {
            result: result,
            valid: true,
            checkingLink: false
          }
        }, function(err){
          $scope.reference = {
            error: err,
            valid: false,
            checkingLink: false
          }
        });
    };

    $scope.saveReference = function() {

      // construct the reference
      var reference = {
        description      : $scope.reference.result.description,
        url              : $scope.reference.result.url,
        title            : $scope.reference.result.title,
        provider_name    : $scope.reference.result.provider_name,
        provider_display : $scope.reference.result.provider_display
      };

      if ($scope.reference.result.images[0]) {
        reference.image = $scope.reference.result.images[0].url;
      }

      // save reference
      DatasetReferenceSrv.save({id:$scope.dataset.id, reference: reference}, function(res){
        console.log('res', res);
        if (res.id) {
          $scope.dataset.references.push(reference);
          $modalInstance.close();
        } else {
          $scope.reference.error = 'Something went wrong.';
        }
      });
    };
  })

  .directive('referencePopup', function($rootScope, EmbedlySrv, DatasetReferenceSrv, $modal){
    return {
      templateUrl: 'app/directives/referencePopup/referencePopup.html',
      restrict: 'EA',
      scope: {
        showReferenceForm: '&',
        dataset: '='
      },

      controller: function($scope, toaster){

        $scope.newReference = function() {

          // Delete any existing reference
          $scope.reference = null;

          var modalInstance = $modal.open({
            templateUrl: 'app/directives/referencePopup/addReferenceModal.html',
            controller: 'ReferenceNewCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              dataset: function() {
                return $scope.dataset;
              }
            }
          });
          modalInstance.result.then(function (distribution) {
            toaster.pop('info', null, 'Datasource saved.');
            console.log(distribution);
          }, function () {
            $log.info('Modal dismissed at: ' + new Date());
          });
        };
      }
    };
  });
