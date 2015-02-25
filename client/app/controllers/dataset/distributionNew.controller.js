'use strict';

angular.module('columbyApp')

  .controller('DistributionNewCtrl', function($log, $rootScope, $scope, $modalInstance, dataset, FileService, toaster, ngProgress, DistributionSrv, $upload) {

    console.log('new distribution controller');

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


    /**
     *
     *  File is uploaded, finish it at the server.
     *
     */
    // function finishUpload(params) {
    //   $log.log('upload: ', $scope.upload);
    //   var params = {
    //     fid: $scope.upload.file.id,
    //     url: 'https://' + $scope.upload.credentials.bucket + '.s3.amazonaws.com/' + $scope.upload.credentials.file.key
    //   };
    //   $log.log('params', params);
    //
    //   FileService.finishS3(params).then(function(res){
    //     $log.log('upload finished',res);
    //     if (res.id){
    //       var d = {
    //         id: $scope.distribution.id,
    //         file_id: res.id
    //       };
    //       if (res.filetype === 'text/csv'){
    //         d.valid = true;
    //         $scope.distribution.valid=true;
    //       }
    //       DistributionSrv.update(d, function(result){
    //         $log.log('Finish upload result:', result);
    //         if (result.id){
    //           $scope.distribution.file_id = result.file_id;
    //
    //           $scope.wizard.step = 4;
    //           $scope.wizard.finishShow = true;
    //           $scope.wizard.finishDisabled = false;
    //         }
    //       });
    //     }
    //     $scope.upload.file = null;
    //   });
    // }



    /** ---------- SCOPE FUNCTIONS ------------------------------------------------ **/

    $scope.startUpload = function(files){
      console.log(files);
      console.log($rootScope.config);

      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          $upload.upload({
            method: 'POST',
            url   : $rootScope.config.filesRoot + '/upload',
            fields: {
              filetype: file.type,
              type: 'datafile',
              filesize: file.size,
              filename: file.name,
              accountId: $scope.distribution.account_id
            },
            file  : file
          }).progress(function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% for ' + evt.config.file.name);
          }).success(function (data, status, headers, config) {
              console.log('file ' + config.file.name + 'uploaded. Response: ');
              console.log('data', data);
          });
        }
      }
    };


    // Initialize a file upload
    $scope.initUpload = function(){
      $scope.distribution.type = 'Download';
      $scope.wizard.step = 2;
    };

    // //Handle file select
    $scope.onFileSelect = function(files) {
      var file = files[0];
      // Check if there is a file
      if (!file) {
        return toaster.pop('warning',null,'No file selected.');
      }
      // Check if there is already an upload in progress
      if ($scope.upload.file){
        return toaster.pop('warning',null,'There is already an upload in progress. ');
      }

      // Check if the file has the right type
      if (!FileService.validateFile(file.type, 'datafile')) {
        return toaster.pop('warning', null, 'The file you chose is not valid. ' + file.type);
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

      $log.log('Uploading with params: ', params);

      FileService.signS3(params).then(function(response) {
        console.log('Response sign: ', response);
        // signed request is valid, send the file to S3
        if (response.file) {
          // Initiate the upload
          FileService.upload($scope, response, file).then(function (res) {
            console.log(res);
            // File upload is done
            if (res.status === 201 && res.statusText === 'Created') {
              ngProgress.complete();
              $log.log($scope.upload);
              $scope.upload.file = response.file;
              $scope.upload.credentials = response.credentials;
              console.log('Finishing uploading. ');
              finishUpload();
            } else {
              return toaster.pop('warning', null, 'Something went wrong finishing the upload. ');
            }
          }, function (error) {
            console.log('Error', error);

          }, function (evt) {
            console.log('Progress: ' + evt.value);
            ngProgress.set(evt.value);
          });
        } else {
          toaster.pop('error', null, 'Sorry, there was an error. Details: ' + reesponse.msg);
          console.log(response);
        }
      });
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
        //console.log('r', response);
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
      console.log('submitting link.');

      // Update the distribution (save the url and validity
      DistributionSrv.update($scope.distribution, function(response){
        console.log('submitlink respononse, ', response);
        if (response.id){
          //toaster.pop('success',null,'Distribution updated.');
          // Go to metadata screen
          $scope.wizard.step = 4;
        }
      });
    };


    $scope.next = function(){
      //console.log($scope.wizard.step);
      if ($scope.wizard.step === 3){
        $scope.wizard.step = 4;
        $scope.wizard.nextShow=false;
        $scope.wizard.finishShow=true;
        $scope.wizard.finishDisabled=false;
      }
    };


    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };


    $scope.close = function(){
      console.log('Closing with distribution: ', $scope.distribution);
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
          toaster.pop('warning', null, 'Something went wrong. ' + response);
        }
      });
    };

  });
