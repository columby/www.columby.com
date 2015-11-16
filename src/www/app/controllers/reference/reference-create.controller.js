(function() {
  'use strict';

  angular
    .module('ng-app')
    .controller('ReferenceCreateCtrl', function($log, $scope, $modalInstance, dataset, ReferenceSrv, EmbedlySrv, ngNotify) {

  // Add received dataset from parent to this scope.
  $scope.dataset = dataset;

  // Definition of wizard steps
  $scope.steps=[
    'type',
    'create-link',
    'upload-file',
    'details',
    'submit'
  ];
  // Current wizard step
  $scope.step='type';

  // Placeholder for reference object
  $scope.reference = {
    dataset_id: dataset.id,
    url   : null,
    valid  : false,
    error  : null,
    result : null
  };


  // Helper to the steps of the wizard.
  $scope.nextStep = function(step){
    $scope.step=step;
  };


  // Validate a given link through the embedly api.
  $scope.validateLink = function(){
    var link = $scope.reference.url;

    $scope.reference.error = null;
    $scope.reference.checkingLink = true;

    EmbedlySrv.extract($scope.reference.url).then(function(result){

      $scope.reference = {
        dataset_id: $scope.dataset.id,
        url: link,
        description: result.description,
        title: result.title,
        provider_name    : result.provider_name,
        provider_display : result.provider_display,
        selectedImage: 0,
        result: result,
        valid: true,
        checkingLink: false
      };

      if (result.images.length>0){
        $scope.reference.image = result.images[ $scope.reference.selectedImage].url;
      }
      // next step
      $scope.step='details';
    }).catch(function(err){
      $scope.reference = {
        error: err,
        valid: false,
        checkingLink: false
      };
    });
  };


  // Browse throught the images provided by embedly.
  $scope.nextImage = function(){
    $scope.reference.selectedImage++;
    if ($scope.reference.selectedImage >= $scope.reference.result.images.length ) {
      $scope.reference.selectedImage = 0;
    }
    $scope.reference.image = $scope.reference.result.images[ $scope.reference.selectedImage].url;
  };


  // Save the reference.
  $scope.save = function() {

    $scope.saveInProgress = true;

    // save reference
    ReferenceSrv.save($scope.reference, function(res){
      $log.debug('Reference result', res);
      if (res.id) {
        $modalInstance.close(res);
      } else {
        ngNotify.set('There was an error saving the reference. (' + res.msg + ')', 'error');
      }
    });
  };
});
})();
