(function() {
  'use strict';

  angular.module('columbyApp')
  .controller('DistributionNewCtrl', function($log, $rootScope, $scope, $modalInstance, dataset, FileSrv, ngNotify, ngProgress, DistributionSrv, Upload, appConstants) {

    // Initialize the new distribution using the provided dataset
    $scope.dataset = dataset;
    $scope.distribution = {
      license: 'cc0',
      account_id: dataset.account_id,
      dataset_id: dataset.id,
      title: 'Datasource'
    };

    // Initialize upload status
    $scope.upload = {
      inProgress: false,
      finished: false
    };

    // Initialize wizard
    $scope.wizard = {
      steps: ['start','data','metadata','finish'],
      step:1,
      cancelShow: true,
      previousShow: false,
      previousDisabled: true,
      nextShow: false,
      nextDisabled: true,
      finishShow: false,
      finishDisabled: true
    };



    /*** ---------- SCOPE FUNCTIONS -------------- ***/
    $scope.startUpload = function(){
      $log.debug('Starting upload');
      // Show the file-manager
      $rootScope.$broadcast('fm-open', {
        account_id: $scope.dataset.account_id,
        select: true,
      });
    };

    // Handle upload file selected
    $scope.$on('fm-selected', function(event,data){
      if (data.file && data.file.id) {

        // Check if the file has the right type
        // if (!FileSrv.validateFile(file.type, 'datafile')) {
        //   return ngNotify.set('The file you chose is not valid. ' + file.type, 'error');
        // }

        // Update distribution with the uploaded file.
        $scope.distribution.file_id = data.file.id;
        $scope.distribution.byteSize = data.file.size;
        $scope.distribution.mediaType = data.file.filetype;
        $scope.distribution.downloadUrl = appConstants.filesRoot + '/f/' + data.file.url;

        $log.debug('new distribution', $scope.distribution);

        // Go to the next step.
        $scope.wizard.step++ ;
        $scope.next();
      } else {
        $log.debug('Something went wrong with the file selection.');
        $log.debug(event);
        $log.debug(data);
      }

    });


    // Initialize a file upload (named localFile indb)
    $scope.initUpload = function(){
      $scope.distribution.type = 'localFile';
      $scope.wizard.step = 2;
    };


    // Initialize a source link
    $scope.initSync = function(){
      $scope.distribution.type = 'remoteService';
      $scope.wizard.step = 3;
    };


    $scope.validateLink = function(){
      // validate if we can read the source
      $scope.distribution.validation = {
        status: 'inprogress',
        valid: false,
        result: null
      };

      DistributionSrv.validateLink({url:$scope.distribution.accessUrl}, function(response){
        $scope.distribution.validation = {
          status: 'done',
          result: response
        };
        $scope.distribution.valid = response.valid;
        // TODO: what mediatype for a link?
        $scope.distribution.mediaType = 'link';
        // TODO: Wat format for a link?
        $scope.distribution.format = 'link';

        $scope.wizard.nextShow = true;
        $scope.wizard.nextDisabled = false;
      });
    };


    $scope.submitLink = function(){
      $log.debug('submitting link.');

      // Update the distribution (save the url and validity
      DistributionSrv.update($scope.distribution, function(response){
        $log.debug('submitlink respononse, ', response);
        if (response.id){
          //ngNotify.set('success',null,'Distribution updated.');
          // Go to metadata screen
          $scope.wizard.step = 4;
        }
      });
    };


    $scope.next = function(){
      $log.debug('Next step: ' + $scope.wizard.step);
      if ($scope.wizard.step === 3){
        $scope.wizard.step = 4;
        $scope.wizard.nextShow=false;
        $scope.wizard.finishShow=true;
        $scope.wizard.finishDisabled=false;
      }
    };


    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


    $scope.close = function(){
      $log.debug('Closing with distribution: ', $scope.distribution);
      $modalInstance.close($scope.distribution);
    };


    $scope.save = function(){
      $scope.updateInProgress = true;

      // save metadata
      DistributionSrv.save($scope.distribution, function(response) {
        $scope.updateInProgress = false;
        if (response.id) {
          $scope.distribution = response;
          $scope.close();
        } else {
          ngNotify.set('Something went wrong. ' + response, 'error');
        }
      });
    };

  });
})();
