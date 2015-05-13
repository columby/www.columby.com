'use strict';

angular.module('columbyApp')

.controller('ReferenceNewCtrl', function($log, $scope, $modalInstance, dataset, DatasetReferenceSrv, EmbedlySrv, ngNotify) {

  $scope.reference = {
    link   : null,
    valid  : false,
    error  : null,
    result : null
  };

  $scope.close = function(){
    console.log('Closing with reference: ', $scope.reference);
    $modalInstance.close($scope.reference);
  };


  $scope.checkReferenceLink = function(link){

    $scope.dataset = dataset;

    $scope.reference.link = link;
    $scope.reference.checkingLink = true;

    EmbedlySrv.extract($scope.reference.link)
      .then(function(result){
        //console.log(result);
        $scope.reference = {
          result: result,
          valid: true,
          checkingLink: false
        };
      }, function(err){
        $scope.reference = {
          error: err,
          valid: false,
          checkingLink: false
        };
      });
  };


  $scope.save = function() {

    $scope.updateInProgress = true;

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
    DatasetReferenceSrv.save({id:$scope.dataset.id, reference:reference}, function(result){
      console.log('reference saved');
      delete $scope.updateInProgress;

      if (result.id) {
        $scope.reference = result;
        $scope.close();
      } else {
        ngNotify.set('Something went wrong. ' + response, 'error');
      }
    });
  };
});
