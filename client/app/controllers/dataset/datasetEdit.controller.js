'use strict';

angular.module('columbyApp')

/**
 *
 *  Controller for a dataset Edit page
 *
 */
.controller('DatasetEditCtrl', function($log,$window, $rootScope, $scope, configSrv, $location, $state, $stateParams, DatasetSrv, DistributionSrv, PrimaryService, DatasetReferenceSrv, UserSrv, TagService, Slug, ngDialog, $http, FileService,ngProgress, $timeout,$modal,$upload, ngNotify) {

    /*-------------------   INITIALISATION   ------------------------------------------------------------------*/
    var modalOpened=false; // Boolean to check if only 1 modal is opened at a time.

    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.datasetUpdate = {};
    $scope.editMode = true;
    $window.document.title = 'columby.com';

    $scope.status = {
      isopen: false
    };

    $scope.datasetLoading = true;  // show loading message while loading dataset

    /*-------------------   FUNCTIONS   -----------------------------------------------------------------------*/
    function getDataset() {

      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          ngNotify.set('Sorry, the requested dataset was not found.', 'error');
          $state.go('home');
          return;
        }

        // check if user has edit-access
        var canEdit = UserSrv.canEdit('dataset', dataset);
        if (canEdit === false) {
          ngNotify.set('You do not have the permission to edit this post.', 'error');
          $state.go('dataset.view', {id: $stateParams.id});
        }

        // transition the url from slug to id
        if ($stateParams.id !== dataset.shortid) {
          $state.transitionTo ('dataset.view', { id: dataset.shortid}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // Update document title
        $window.document.title = 'columby.com | ' + dataset.title;
        $scope.datasetLoading  = false;

        // Make sure there is a reference array
        if (!dataset.references) {
          dataset.references = [];
        }

        // Add the dataset to the scope
        $scope.dataset = dataset;

        $scope.dataset.account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.dataset.account.avatar.shortid + '/' + $scope.dataset.account.avatar.filename;
        // set draft title and description
        $scope.datasetUpdate.title = $scope.dataset.title;
        $scope.datasetUpdate.description = $scope.dataset.description;

        // Update the header image
        if ($scope.dataset.headerImg && $scope.dataset.headerImg.id) {
          updateHeaderImage();
        }
      });
    }


    /**
     * File is uploaded, finish it at the server.
     *
     * @param params
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
              console.log('updating header image');
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


    /**
     * Start with a new dataset, published on the user's primary account.
     *
     */
    function initiateNewDataset(){
      console.log('Initiating new dataset.');
      // if user has multiple accounts, show the account-selector.
      if ($rootScope.user.accounts.length > 1) {
        //$scope.showAccountSelector = true;
        showAccountSelector();
      }

      //dataset.account.avatar.url
      $scope.dataset = {
        title: null,
        description: null,
        account: $rootScope.user.accounts[ 0],
        account_id: $rootScope.user.accounts[ 0].id,
        canEdit: true
      };

      $scope.datasetLoading  = false;

      ngNotify.set('Here\'s your new dataset!');
    }


    /**
     * Update the header background image
     *
     */
    function updateHeaderImage(){
      if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.dataset.headerImg.shortid + '/' + $scope.dataset.headerImg.filename;
        $scope.headerStyle = {
          'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
          'background-blend-mode': 'multiply'
        };
      }
    }


    function showAccountSelector(){
      var modalInstance = $modal.open({
        templateUrl: 'views/account/partials/selector.html',
        controller: 'AccountSelectorCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          user: function () {
            return $rootScope.user.accounts;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        console.log(selectedItem);
        updateDatasetOwner(selectedItem);
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    }


    /**
     *
     * Change the owner of the dataset.
     *
     */
    function updateDatasetOwner(id){
      console.log(id);
      $scope.dataset.account_id = $rootScope.user.accounts[ id].id;
      $scope.dataset.account = $rootScope.user.accounts[ id];
      //$scope.showAccountSelector = false;
    }


    $scope.updateSlug = function(){
      var slug = Slug.slugify($scope.dataset.slug);
      var d={
        id: $scope.dataset.id,
        slug: slug
      };
      DatasetSrv.update({id: d.id}, d, function(res){
        //console.log(res);
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


    /*-------------------   SCOPE FUNCTIONS   -----------------------------------------------------------------*/

    /*********** OPTIONS ********************************/
    $scope.showAccountSelector = function(){
      showAccountSelector();
    };


    /**
     *
     * Show or hide the options menu
     *
     */
    $scope.toggleOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    };


    /**
     *
     * Toggle private mode for a dataset.
     *
     * @param status
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
      console.log('Yes there is a file. ');

      // Check if there is already an upload in progress
      if ($scope.upload && $scope.upload.file) {
        return ngNotify.set('There is already an upload in progress. ','error');
      }
      console.log('There is not already an upload in progress. ');

      // Check if the file has the right type
      if (!FileService.validateFile(file.type,type,target)) {
        return ngNotify.set('The file you chose is not valid. ' + file.type, 'error');
      }
      console.log('File is valid. ');

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
        url   : $rootScope.config.filesRoot + '/upload',
        fields: params,
        file  : file,
      })

      .progress(function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //console.log('progress: ' + progressPercentage + '% for ' + evt.config.file.name);
        ngProgress.set(progressPercentage);
      })

      .success(function (data, status, headers, config) {
        //console.log('File ' + config.file.name + 'uploaded.');
        //console.log('Data', data);
        // File upload is done
        if (data.status === 'ok') {
          ngProgress.complete();
          // finish
          $scope.upload.file = null;
          ngNotify.set('File uploaded. ');
          console.log('File uploaded: ', data);

          var updated = {
            id: $scope.dataset.shortid
          };

          switch(target){
            case 'header':
              console.log('updating header image');
              $scope.dataset.headerImg = data.file;
              $scope.dataset.headerimg_id = data.file.id;
              updateHeaderImage();
              updated.headerimg_id = data.file.id;
              break;
          }
          $scope.fileUpload = null;
          ngNotify.set('File uploaded, updating account...');
          console.log('updating, ', updated);

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



    /*********** DATASET FUNCTIONS ********************************/
    /**
     *
     * Create a new dataset
     *
     */
    $scope.create = function() {
      $scope.dataset.title = $scope.datasetUpdate.title;
      $scope.dataset.description = $scope.datasetUpdate.description;
      DatasetSrv.save($scope.dataset, function(res){
        console.log('New dataset received: ' + res.id);
        if (res.id) {
          ngNotify.set('Your dataset page is created. Now add some data.');
          $state.go('datasetEdit', {id:res.shortid});
        }
      });
    };

    /**
     *
     * Update an existing dataset.
     *
     */
    $scope.update = function(){
      if (!$scope.dataset.id) {
        console.log('unpublished. ');
      } else {
        var changed = false;
        var dataset = {
          id: $scope.dataset.id,
          title: $scope.dataset.title,
          description: $scope.dataset.description
        };
        if (dataset.title !== $scope.datasetUpdate.title) {
          console.log('name changed');
          dataset.title = $scope.datasetUpdate.title;
          changed = true;
        }
        if (dataset.description !== $scope.datasetUpdate.description){
          console.log('description changed');
          dataset.description = $scope.datasetUpdate.description;
          changed = true;
        }
        if (changed){
          DatasetSrv.update({id: dataset.id}, dataset,function(result){
            if (result.id){
              $scope.datasetUpdate.title = result.title;
              $scope.datasetUpdate.description = result.description;
              ngNotify.set('Dataset updated.');
            } else {
              ngNotify.set('There was an error updating the dataset.', 'error');
            }
          });
        }
      }
    };


    /**
     *
     * Delete a Dataset
     *
     **/
    $scope.delete = function() {

      if (modalOpened) { return; }

      $scope.showOptions = !$scope.showOptions;

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/confirmDelete.html',
        controller: 'DatasetDeleteCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          dataset: function () {
            return $scope.dataset;
          }
        }
      });

      modalOpened=true;

      modalInstance.result.then(function(result) {
        console.log(result);
        if (result.status === 'error'){
          ngNotify.set('There was a problem deleting the distribution. (' + result.msg + ')', 'error');
        } else {
          $state.go('home');
          ngNotify.set('Dataset deleted.');
        }
        modalOpened=false;
      }, function() {
        modalOpened=false;
      });
    };


    /*********** REFERENCE FUNCTIONS ********************************/
    $scope.newReference = function() {

      // Make sure only 1 modal is opened at a time.
      if (modalOpened) { return; }

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/reference/new.html',
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

      modalOpened=true;

      modalInstance.result.then(function(reference) {
        ngNotify.set('Reference saved.');
        $scope.dataset.references.push(reference);
        modalOpened=false;
      }, function () {
        // Delete the created datasource
        DatasetReferenceSrv.delete({id:$scope.dataset.id, reference: $scope.reference}, function(res){
          console.log('deleted');
          console.log(res);
        });
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    $scope.confirmDeleteReference = function(index){
      $scope.dataset.distributions[ index].confirmDelete = true;
      // turn the confirmation off automatically
      $timeout(function(){
        $scope.dataset.distributions[ index].confirmDelete = false;
      }, 5000);
    };

    /**
     *
     * Delete an attached reference
     *
     */
    $scope.deleteReference = function(reference){
      console.log($scope.dataset);
      console.log(reference);
      var idx = $scope.dataset.references.indexOf(reference);
      var id = $scope.dataset.id;
      var referenceId = reference.id;
      console.log('referenceId ', referenceId);

      DatasetReferenceSrv.delete({id:id, rid:referenceId}, function(res){
        if (res.status === 'success') {
          $scope.dataset.references.splice(idx, 1);
          ngNotify.set('Reference deleted.');
        } else {
          ngNotify.set('There was a problem deleting the reference.');
        }
      });
    };



    /*********** DISTRIBUTIONS ********************************/
    $scope.newDistribution = function() {

      // Make sure only 1 modal is opened at a time.
      if (modalOpened) { return; }

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/distribution/new.html',
        controller: 'DistributionNewCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          dataset: function() {
            return $scope.dataset;
          }
        }
      });

      modalOpened=true;

      modalInstance.result.then(function (distribution) {
        ngNotify.set('Datasource saved.');
        $scope.dataset.distributions.push(distribution);
        modalOpened=false;
      }, function () {
        // Delete the created datasource
        DistributionSrv.delete($scope.distribution, function(res){
          console.log('deleted');
          console.log(res);
        });
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


    $scope.editDistribution = function(distribution){

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/distribution/edit.html',
        controller: 'DistributionEditCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          distribution: function () {
            return distribution;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        console.log(selectedItem);
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     * Confirm the deletion of a distribution
     *
     */
    $scope.confirmDeleteDistribution = function(index){
      $scope.dataset.distributions[ index].confirmDelete = true;
      // turn the confirmation off automatically
      $timeout(function(){
        $scope.dataset.distributions[ index].confirmDelete = false;
      }, 5000);
    };

    /**
     *
     * Delete a distriubtion from the server
     *
     */
    $scope.deleteDistribution = function(distribution){
      var idx = $scope.dataset.distributions.indexOf(distribution);
      DistributionSrv.delete({id: $scope.dataset.distributions[ idx].id}, function(res){
        if (res.status === 'success') {
          $scope.dataset.distributions.splice(idx,1);
          ngNotify.set('Distribution deleted.');
        } else {
          console.log(res);
          ngNotify.set('There was a problem deleting the distribution.', 'error');
        }
      });
    };



    /************* PRIMARY SOURCE ***************/
    /***
     *
     * Handle the request to convert a distribution to a primary source.
     *
     */
    $scope.convertPrimary = function(dist){
      var idx = $scope.dataset.distributions.indexOf(dist);
      // Create an object to send to the primaryController
      $scope.newPrimary = {
        dataset_id: $scope.dataset.id,
        distribution_id: $scope.dataset.distributions[ idx].id,
        syncPeriod: 0,
        dataset: {
          shortid: $scope.dataset.shortid,
          title: $scope.dataset.title
        }
      };
      console.log('newPrimary: ', $scope.newPrimary);

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/primary/new.html',
        controller: 'PrimaryNewCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          distribution: function () {
            return $scope.dataset.distributions[ idx];
          },
          primary: function(){
            return $scope.newPrimary;
          }
        }
      });

      modalInstance.result.then(function(primary) {
        console.log(primary);
        console.log($scope.dataset);
        //$scope.selected = selectedItem;
        $scope.dataset.primary = primary;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


    /**
     *
     * Delete a primary source
     *
     */
    $scope.deletePrimarySource = function(){
      if ($scope.dataset.primary.id){
        PrimaryService.delete({id: $scope.dataset.primary.id}, function(result){
          console.log(result);
          if (result.status === 'success'){
            $scope.dataset.primary = null;
            ngNotify.set('The primary source was deleted successfully');
          } else {
            ngNotify.set('There was an error deleting the primary source.','error');
          }
        });
      }
    };


    $scope.editPrimarySource = function(){
      console.log($scope.dataset.primary);

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/primary/edit.html',
        controller: 'PrimaryEditCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        resolve: {
          primary: function() {
            return $scope.dataset.primary;
          }
        }
      });

      modalInstance.result.then(function (primary) {
        console.log(primary);
        $scope.dataset.primary = primary;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    /**
     *
     * Sync a primary source
     *
     */
    $scope.syncPrimarySource = function(){
      $scope.syncInProgress=true;
      // Check if the primary is valid for resyncing
      // type (fortes,csv,arcgis
      var job = {
        id: $scope.dataset.primary.id,
        jobType: $scope.dataset.primary.jobType,
        datasetId: $scope.dataset.id,
        primaryId: $scope.dataset.primary.id
      };

      // Send request to api
      PrimaryService.sync(job, function(r){
        ngNotify.set('The primary source will be synchronised. ');
        $scope.dataset.primary.jobStatus = 'active';
        // Process response
        console.log('result', r);
      });


    };


    $scope.closeDialog = function(){
      ngDialog.closeAll();
    };

    //$scope.loadTags = function(query) {
    //  //console.log('querying, ', query);
    //  //var r=TagService.query(query);
    //  //console.log(r);
    //};

    $scope.addTag = function(tag){
      console.log('adding tag', tag);
      DatasetSrv.addTag({
        id: $scope.dataset.id,
        tag: tag
      }, function(result){
          console.log('dtaset addtag result: ', result);
      });
    };


    $scope.removeTag = function(tag){
      console.log('removing tag, ', tag);
      DatasetSrv.removeTag({id:$scope.dataset.id, tid:tag.id},function(result){
        console.log('dataset remove result: ', result);
      });
    };


    /* --------- INIT ------------------------------------------------------------------------ */
    // Check if user is authenticated
    if (!UserSrv.isAuthenticated()){
      ngNotify.set('You need to be authenticated to be able to edit this post. ', 'error');
      $state.go('dataset', { id: $stateParams.id });
    } else if ($stateParams.id) {
      getDataset();
    } else if($rootScope.user.id){
      initiateNewDataset();
    } else {
      $state.go('home');
    }
  }
);
