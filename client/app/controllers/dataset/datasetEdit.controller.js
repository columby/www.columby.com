'use strict';

angular.module('columbyApp')

/**
 *
 *  Controller for a dataset Edit page
 *
 */
.controller('DatasetEditCtrl', function($log,$window, $rootScope, $scope, configSrv, $location, $state, $stateParams, DatasetSrv, DistributionSrv, PrimaryService, DatasetReferenceSrv, AuthSrv, TagService, toaster, Slug, ngDialog, $http, FileService,ngProgress, $timeout,$modal) {

    /*-------------------   INITIALISATION   ------------------------------------------------------------------*/
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.datasetUpdate = {};
    $scope.editMode = true;
    $window.document.title = 'columby.com';

    $scope.status = {
      isopen: false
    };

    /*-------------------   FUNCTIONS   -----------------------------------------------------------------------*/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset

      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
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

        console.log(dataset);

        // Update document title
        $window.document.title = 'columby.com | ' + dataset.title;
        $scope.contentLoading = false;

        // Make sure there is a reference array
        if (!dataset.references){
          dataset.references = [];
        }

        // Add the dataset to the scope
        $scope.dataset = dataset;

        // set draft title and description
        $scope.datasetUpdate.title = $scope.dataset.title;
        $scope.datasetUpdate.description = $scope.dataset.description;

        // Update the header image
        if ($scope.dataset.headerImg && $scope.dataset.headerImg.url) {
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
          toaster.pop('notice',null,'File uploaded, updating dataset...');

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
      console.log($rootScope);
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

      toaster.pop('notice',null,'Here\'s your new dataset!');
    }

    /**
     * Update the header background image
     *
     */
    function updateHeaderImage(){
      if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = configSrv.apiRoot + '/v2/file/' + $scope.dataset.headerImg.id + '?style=large';
        $scope.headerStyle = {
          'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
          'background-blend-mode': 'multiply'
        };
      }
    }


    function showAccountSelector(){
      console.log('show selector');
      var modalInstance = $modal.open({
        templateUrl: 'views/account/partials/selector.html',
        controller: 'AccountSelectorCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
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


    /*-------------------   SCOPE FUNCTIONS   -----------------------------------------------------------------*/

    $scope.showAccountSelector = function(){
      showAccountSelector();
    };

    /**
     * Change the owner of the dataset.
     *
     * @param id
     */
    function updateDatasetOwner(id){
      console.log(id);
      $scope.dataset.account_id = $rootScope.user.accounts[ id].id;
      $scope.dataset.account = $rootScope.user.accounts[ id];
      //$scope.showAccountSelector = false;
    }

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
          toaster.pop('success', null, 'Dataset visibility status updated to  ' + newStatus);
        } else {
          toaster.pop('error', null, 'There was an error updating the setting.');
        }
      });
    };

    /**
     * Handle file select
     *
     * @param $files
     * @param type (file, image, datafile)
     * @param target (headerImage, accountFile, avatar)
     */
    $scope.onFileSelect = function($files, type, target) {
      $log.log('type',type);

      var file = $files[0];

      $scope.fileUpload = {
        type: type,
        target: target
      };

      // Check if there is a file
      if (!file) {
        return toaster.pop('warning',null,'No file selected.');
      }
      // Check if there is already an upload in progress
      if ($scope.upload){
        return toaster.pop('warning',null,'There is already an upload in progress. ');
      }
      // Check if the file has the right type
      if (!FileService.validateFile(file.type,type,target)) {
        return toaster.pop('warning', null, 'The file you chose is not valid. ' + file.type);
      }

      ngProgress.start();

      var params = {
        filetype: file.type,
        filesize: file.size,
        filename: file.name,
        accountId: $scope.dataset.account.id,
        type: type,
        target: target
      };

      $log.log('Uploading with params: ', params);

      // Sign the upload request
      FileService.signS3(params).then(function(signedResponse) {
        console.log('Response sign: ', signedResponse);
        // signed request is valid, send the file to S3
        if (signedResponse.file) {
          // Initiate the upload
          FileService.upload($scope, signedResponse, file).then(function(res){
            // File upload is done
            if (res.status === 201 && res.statusText==='Created') {
              ngProgress.complete();
              $log.log($scope.fileUpload);
              $scope.fileUpload.file = signedResponse.file;
              $scope.fileUpload.credentials = signedResponse.credentials;
              console.log('Finishing uploading. ');

              finishUpload();
            } else {
              return toaster.pop('warning',null,'Something went wrong finishing the upload. ');
            }
          }, function(error){
            console.log('Error', error);

          }, function(evt) {
            console.log('Progress: ' + evt.value);
            ngProgress.set(evt.value);
          });
        } else {
          toaster.pop('error', null, 'Sorry, there was an error. Details: ' +  signedResponse.msg);
          console.log(signedResponse);
        }
      });
    };


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
          toaster.pop('success', null, 'Your dataset page is created. Now add some data.');
          $state.go('dataset.edit', {id:res.shortid});
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
              toaster.pop('success', null, 'Dataset updated.');
            } else {
              toaster.pop('warning', null, 'There was an error updating the dataset.');
            }
          });
        }
      }
    };

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
          toaster.pop('success', 'Updated', 'Dataset custom URL updated.');
        } else if (res.err && res.err.errors.slug){
          toaster.pop('error', 'Update error', 'There was an error setting the custom URL: ' + res.err.errors.slug.message);
        } else {
          toaster.pop('error', 'Update error', 'There was an error updating the custom URL.');
        }
      });
    };


    $scope.confirmDeleteReference = function(index){
      $scope.dataset.references[ index].confirmDelete = true;
    };

    /**
     *
     * Delete an attached reference
     *
     * @param index
     */
    $scope.deleteReference = function(reference){
      var idx = $scope.dataset.references.indexOf(reference);
      var id = $scope.dataset.id;
      var referenceId = reference.id;

      DatasetReferenceSrv.delete({id:id, rid:referenceId}, function(res){
        if (res.status === 'success') {
          $scope.dataset.references.splice(idx, 1);
          toaster.pop('success', null, 'Reference deleted.');
        } else {
          toaster.pop('success', null, 'There was a problem deleting the reference.');
        }
      });

    };


    $scope.newDistribution = function() {
      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/distribution/new.html',
        controller: 'DistributionCreateCtrl',
        size: 'lg',
        backdrop: 'static',
        keyboard: false
        //resolve: {
        //  distribution: function () {
        //    return distribution;
        //  }
        //}
      });

      modalInstance.result.then(function (selectedItem) {
        console.log(selectedItem);
        $scope.selected = selectedItem;
      }, function () {
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
     * @param index
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
     * @param index
     */
    $scope.deleteDistribution = function(distribution){
      var idx = $scope.dataset.distributions.indexOf(distribution);
      DistributionSrv.delete({id: $scope.dataset.distributions[ idx].id}, function(res){
        if (res.status === 'success') {
          $scope.dataset.distributions.splice(idx,1);
          toaster.pop('success', 'Done', 'Distribution deleted.');
        } else {
          toaster.pop('danger', null, 'There was a problem deleting the distribution.');
        }
      });
    };



    /************* PRIMARY SOURCE ***************/

    /**
     *
     * Handle the request to convert a distribution to a primary source.
     *
     * @param dist
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
        controller: 'DatasetPrimaryCtrl',
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

    ///**
    // * Create a new primary source
    // */
    //$scope.createPrimary = function(){
    //  var primary = {
    //    syncperiod: $scope.newPrimary.syncPeriod,
    //    dataset_id: $scope.newPrimary.dataset_id,
    //    distribution_id: $scope.newPrimary.distribution_id
    //  };
    //  console.log('new Primary: ', primary);
    //
    //};

    /**
     * Delete a primary source
     */
    $scope.deletePrimarySource = function(){
      if ($scope.dataset.primary.id){
        PrimaryService.delete({id: $scope.dataset.primary.id}, function(result){
          console.log(result);
          if (result.status === 'success'){
            $scope.dataset.primary = null;
            toaster.pop('success',null,'The primary source was deleted successfully');
          } else {
            toaster.pop('warning',null,'There was an error deleting the primary source.');
          }
        });
      }
    };

    $scope.editPrimarySource = function(){
      console.log($scope.dataset.primary);

      var modalInstance = $modal.open({
        templateUrl: 'views/dataset/primary/edit.html',
        controller: 'DatasetPrimaryEditCtrl',
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


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.id) {
      getDataset();
    } else if($rootScope.user.id){
      initiateNewDataset();
    } else {
      $state.go('home');
    }
  }
);
