'use strict';

angular.module('columbyApp')

  .directive('referencePopup', function($rootScope, EmbedlySrv, DatasetReferenceSrv, ngDialog){
    return {
      templateUrl: 'app/directives/referencePopup/referencePopup.html',
      restrict: 'EA',
      scope: {
        showReferenceForm: '&',
        dataset: '='
      },

      controller: function($scope){

        $scope.newReference = function() {

          // Delete any existing reference
          $scope.reference = null;

          // Open the dialog with the form
          ngDialog.open({
            template: 'app/directives/referencePopup/addReferenceModal.html',
            className: 'ngdialog-theme-default fullscreenDialog',
            scope: $scope
          });
        };

        $scope.checkReferenceLink = function(link){

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
              ngDialog.closeAll();
            } else {
              $scope.reference.error = 'Something went wrong.';
            }
          });
        };
      }
    };
  });
