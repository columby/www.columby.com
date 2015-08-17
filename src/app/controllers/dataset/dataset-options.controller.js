(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('DatasetOptionsCtrl', function($log,dataset, account, $modalInstance, $rootScope, $scope, DatasetSrv,ngNotify,appConstants, $modal,$state,Slug,FileService,ngProgress,$upload) {

      var modalOpened = false;

  // add account datasets that have not been added tot the account to the dataset
  var datasetRegistryIds = [];
  for (var i=0; i<dataset.registries.length;i++){
    datasetRegistryIds.push(dataset.registries[ i].id);
  }

  for (i=0; i<account.registries.length; i++){
    $log.debug('Account registry id: ' + account.registries[ i].id);
    if (datasetRegistryIds.indexOf(account.registries[ i].id) === -1) {
      $log.debug(account.registries[ i]);
      var dr = account.registries[ i];
      dr.dataset_registries = {
        status: false,
        registry_id: dr.id,
        dataset_id: dataset.id
      };
      dataset.registries.push(dr);
    } else {
      dataset.registries[ datasetRegistryIds.indexOf(account.registries[ i].id)].account_registries = account.registries[ i].account_registries;
    }
  }

  $scope.dataset = dataset;
  $scope.account = account;


  /**
   * Update the header background image
   */
  function updateHeaderImage(){
    if ($scope.dataset.headerImg) {
      $scope.dataset.headerImg.url = appConstants.filesRoot + '/a/' + $scope.dataset.headerImg.shortid + '/' + $scope.dataset.headerImg.filename;
      $scope.headerStyle = {
        'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }
  }


  /**
   * File is uploaded, finish it at the server.
   */
  function finishUpload(){

    $log.log('fileUpload: ', $scope.fileUpload);
    var params = {
      fid: $scope.fileUpload.file.id,
      url: 'https://' + $scope.fileUpload.credentials.bucket + '.s3.amazonaws.com/' + $scope.fileUpload.credentials.file.key
    };
    $log.log('params', params);

    FileService.finishS3(params).then(function(res){
      if (res.url) {
        var updated={
          id: $scope.dataset.id
        };
        switch($scope.fileUpload.target){
          case 'header':
            $log.debug('updating header image');
            $scope.dataset.headerImg = res;
            updated.headerImg=res.id;
            updateHeaderImage();
            break;
        }
        $scope.fileUpload = null;
        ngNotify.set('File uploaded, updating dataset...');

        // Update Account at server
        DatasetSrv.update(updated, function(result){
          $log.log('Account updated, ', result);
        });

      } else {
        $scope.fileUpload = null;
      }
    });
  }


  $scope.updateSlug = function(){
    var slug = Slug.slugify($scope.dataset.slug);
    var d={
      id: $scope.dataset.id,
      slug: slug
    };
    DatasetSrv.update({id: d.id}, d, function(res){
      //$log.debug(res);
      if (res.id) {
        $scope.dataset.slug = res.slug;
        ngNotify.set('Dataset custom URL updated.');
      } else if (res.err && res.err.errors.slug){
        ngNotify.set('There was an error setting the custom URL: ' + res.err.errors.slug.message);
      } else {
        ngNotify.set('There was an error updating the custom URL.');
      }
    });
  };


  /**
   *
   * Delete a Dataset
   *
   **/
  $scope.delete = function() {

    if (modalOpened) { return; }

    $scope.showOptions = !$scope.showOptions;

    modalOpened=true;

    $modal.open({
      templateUrl: 'views/dataset/confirm-delete.html',
      controller: 'DatasetDeleteCtrl',
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        dataset: function () {
          return $scope.dataset;
        }
      }
    }).result.then(function(result) {
      $log.debug(result);
      if (result.status === 'error'){
        ngNotify.set('There was a problem deleting the dataset. (' + result.msg + ')', 'error');
      } else {
        $state.go('home');
        ngNotify.set('Dataset deleted.');
      }
      modalOpened=false;
    }, function() {
      modalOpened=false;
    });
  };


  /**
   *
   * Toggle private mode for a dataset.
   *
   */
  $scope.toggleDatasetPrivacy = function(){
    var newStatus = !$scope.dataset.private;
    $scope.dialogMsg = 'Setting visibility status to ' + !newStatus;
    var dataset = {
      id: $scope.dataset.id,
      private: newStatus
    };
    DatasetSrv.update({id: dataset.id}, dataset, function(res){
      if (res.id){
        $scope.dataset.private = newStatus;
        ngNotify.set('Dataset visibility status updated to  ' + newStatus);
      } else {
        ngNotify.set('There was an error updating the setting.');
      }
    });
  };

  $scope.startUpload = function(files,type,target){
    var file = files[0];
    $scope.fileUpload = {
      type: type,
      target: target
    };

    // Check if there is a file
    if (!file) { return ngNotify.set('warning',null,'No file selected.'); }
    $log.debug('Yes there is a file. ');

    // Check if there is already an upload in progress
    if ($scope.upload && $scope.upload.file) {
      return ngNotify.set('There is already an upload in progress. ','error');
    }
    $log.debug('There is not already an upload in progress. ');

    // Check if the file has the right type
    if (!FileService.validateFile(file.type,type,target)) {
      return ngNotify.set('The file you chose is not valid. ' + file.type, 'error');
    }
    $log.debug('File is valid. ');

    $scope.upload = {
      file: file
    };

    ngProgress.color('#2FCCFF');
    ngProgress.start();
    var params = {
      filetype: file.type,
      filesize: file.size,
      filename: file.name,
      accountId: $scope.dataset.account_id,
      type: type,
      target: target
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
    }).success(function (data) {
      //$log.debug('File ' + config.file.name + 'uploaded.');
      //$log.debug('Data', data);
      // File upload is done
      if (data.status === 'ok') {
        ngProgress.complete();
        // finish
        $scope.upload.file = null;
        ngNotify.set('File uploaded. ');
        $log.debug('File uploaded: ', data);

        var updated = {
          id: $scope.dataset.shortid
        };

        switch(target){
          case 'header':
            $log.debug('updating header image');
            $scope.dataset.headerImg = data.file;
            $scope.dataset.headerimg_id = data.file.id;
            updateHeaderImage();
            updated.headerimg_id = data.file.id;
            break;
        }
        $scope.fileUpload = null;
        ngNotify.set('File uploaded, updating account...');
        $log.debug('updating, ', updated);

        // Update Account at server
        DatasetSrv.update({id: $scope.dataset.id}, updated, function(result){
          $log.log('Account updated, ', result);
        });

      } else {
        $scope.upload.file = null;
        return ngNotify.set('Something went wrong finishing the upload. ', 'error');
      }

    });
  };


  $scope.toggleDatasetRegistry = function($index, registry){
    var status = !registry.dataset_registries.status;
    DatasetSrv.updateRegistry({id: dataset.id, rid: registry.id},{ status:status }, function(result){
      $scope.dataset.registries[ $index].dataset_registries = result;
    });
  };
});
})();
