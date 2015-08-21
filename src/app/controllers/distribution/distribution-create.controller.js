(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('DistributionNewCtrl', function($log, $rootScope, $scope, $modalInstance, dataset, FileService, ngNotify, ngProgress, DistributionSrv, $upload, appConstants) {


    $scope.distribution = {
      license: 'cc0',
      account_id: dataset.account_id,
      dataset_id: dataset.id,
      title: 'Datasource'
    };


    $scope.upload = {
      inProgress: false,
      finished: false
    };


    $scope.wizard={
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



    /** ---------- SCOPE FUNCTIONS ------------------------------------------------ **/

    $scope.startUpload = function(files){
      var file = files[0];
      // Check if there is a file
      if (!file) {
        return ngNotify.set('No file selected.', 'error');
      }
      // Check if there is already an upload in progress
      if ($scope.upload.file){
        return ngNotify.set('There is already an upload in progress. ', 'error');
      }
      // Check if the file has the right type
      if (!FileService.validateFile(file.type, 'datafile')) {
        return ngNotify.set('The file you chose is not valid. ' + file.type, 'error');
      }

      $scope.upload.file = file;

      ngProgress.start();
      var params = {
        filetype: file.type,
        type: 'datafile',
        filesize: file.size,
        filename: file.name,
        accountId: $scope.distribution.account_id
      };

      $upload.upload({
        method: 'POST',
        url   : appConstants.filesRoot + '/upload',
        fields: params,
        file  : file,
      })

      .progress(function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //$log.debug('progress: ' + progressPercentage + '% for ' + evt.config.file.name);
        ngProgress.set(progressPercentage);
      })

      .success(function (data, status, headers, config) {
        //$log.debug('File ' + config.file.name + 'uploaded.');
        //$log.debug('Data', data);
        // File upload is done
        if (data.status === 'ok') {
          ngProgress.complete();
          // finish
          $scope.upload.file = null;
          ngNotify.set('File uploaded. ');

          // Update distribution with the uploaded file.
          $scope.distribution.file_id = data.file.id;
          $scope.distribution.byteSize = data.file.size;
          $scope.distribution.mediaType = data.file.filetype;
          $scope.distribution.downloadUrl = appConstants.filesRoot + '/d/' + data.file.shortid + '/' + data.file.filename;

          // $log.debug('dist', $scope.distribution);

          // Go to the next step.
          $scope.wizard.step++ ;
          $scope.upload.finished = true;
          $scope.next();

        } else {
          $scope.upload.file = null;
          return ngNotify.set('Something went wrong finishing the upload. ','danger');
        }
      });
    };


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
        //$log.debug('r', response);
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
      $log.debug($scope.wizard.step);
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
