(function() {
  'use strict';

  angular.module('columbyApp').controller('DatasetEditCtrl', function($log, dataset, $rootScope, $scope, appConstants, $state, $stateParams, AccountSrv, DatasetSrv, DistributionSrv, PrimarySrv, ReferenceSrv, TagService, Slug, FileSrv,ngProgress, $timeout,$modal,Upload, ngNotify, AuthSrv) {

  // Check existence
  if (!dataset.id){
    ngNotify.set('Sorry, the requested dataset was not found.', 'error');
    $state.go('home');
    return;
  }

  // Check access
  var permission = AuthSrv.hasPermission('edit dataset', dataset);
  if (!permission) {
    ngNotify.set('Sorry, no access.', 'error');
    $state.go('dataset.view',{id: $stateParams.id});
    return;
  }

  // get account details for dataset accuont
  AccountSrv.get({slug: dataset.account.slug}, function(result){
    //$log.debug(result);
    $scope.dataset.account = result;
  });

  // Initialisation
  $scope.dataset = dataset;
  $log.debug(dataset);
  // if ($scope.dataset.account.avatar) {
  //   $scope.dataset.account.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.dataset.account.avatar.filename;
  // }
  var modalOpened = false;
  $rootScope.title = 'columby.com | ' + dataset.title;
  // Make sure there is a reference array
  $scope.dataset.references = $scope.dataset.references || [];
  // Copy the values to detect changes later
  $scope.datasetOriginal = angular.copy($scope.dataset);
  // Update the header image
  if ($scope.dataset.headerImg && $scope.dataset.headerImg.id) {
    //updateHeaderImage();
  }

  $scope.newTag = {text:null};

  /**
   * Update the header background image
   */
  function updateHeaderImage(){
    if ($scope.dataset.headerImg) {
      $scope.headerStyle = {
        'background-image': 'linear-gradient(transparent,transparent), url(/assets/img/default-header-bw.svg), url(' + appConstants.filesRoot + '/s/large/' + $scope.dataset.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }
  }
  updateHeaderImage();
  // Show or hide the options menu
  $scope.showOptions = function(){
    $modal.open({
      size: 'lg',
      templateUrl: 'views/dataset/modals/dataset-edit-options.html',
      controller: 'DatasetOptionsCtrl',
      backdrop: 'static',
      resolve: {
        dataset: function() {
          return $scope.dataset;
        },
        account: function(){
          return AccountSrv.get({slug: dataset.account.slug}).$promise;
        }
      }
    });
  };

  $scope.showTagsModal = function() {
    $modal.open({
      size: 'lg',
      templateUrl: 'views/dataset/modals/dataset-tag-options.html',
      controller: 'DatasetTagsCtrl',
      backdrop: 'static',
      resolve: {
        dataset: function() {
          return $scope.dataset;
        }
      }
    });
  };

  /**
   *
   * Update an existing dataset.
   *
   */
  $scope.update = function(){
    // check for change
    var changed = !angular.equals($scope.datasetOriginal, $scope.dataset);
    $log.debug('Dataset changed: ' + changed);
    if (changed) {
      DatasetSrv.update({id: $scope.dataset.id}, $scope.dataset, function(result){
        if (result.id){
          $scope.dataset = result;
          $scope.datasetOriginal = angular.copy(result);
          ngNotify.set('Dataset updated.');
        } else {
          ngNotify.set('There was an error updating the dataset. (Error message: ' + result.message + ')', 'error');
        }
      });
    }
  };


  /*********** REFERENCE FUNCTIONS ********************************/
  $scope.createReference = function() {

    // Make sure only 1 modal is opened at a time.
    if (modalOpened) { return; }

    var modalInstance = $modal.open({
      templateUrl: 'views/dataset/reference/create.html',
      controller: 'ReferenceCreateCtrl',
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
      ngNotify.set('Reference saved.', reference);
      $scope.dataset.references.push(reference);
      modalOpened=false;
    }, function () {
      modalOpened=false;
    });
  };

  $scope.editReference = function(reference) {
    $log.debug('edit reference', reference);
    // Make sure only 1 modal is opened at a time.
    if (modalOpened) { return; }

    var modalInstance = $modal.open({
      templateUrl: 'views/dataset/reference/create.html',
      controller: 'ReferenceEditCtrl',
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      resolve: {
        dataset: function() {
          return $scope.dataset;
        },
        reference: function(){
          return reference;
        }
      }
    });

    modalOpened=true;

    modalInstance.result.then(function(reference) {
      ngNotify.set('Reference edited.', reference);
      modalOpened=false;
    }, function () {
      modalOpened=false;
    });
  };

  $scope.confirmDeleteReference = function(index){
    $scope.dataset.distributions[ index].confirmDelete = true;
    // turn the confirmation off automatically
    $timeout(function(){
      $scope.dataset.distributions[ index].confirmDelete = false;
    }, 5000);
  };

  $scope.deleteReference = function(reference){
    var idx = $scope.dataset.references.indexOf(reference);
    $log.debug(reference);
    ReferenceSrv.delete({id:reference.id}, function(res){
      $log.debug(res);
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
    }, function() {
      // Delete the created datasource
      DistributionSrv.delete($scope.distribution, function(res){
        $log.debug('deleted');
        $log.debug(res);
      });
      $log.info('Modal dismissed at: ' + new Date());
      modalOpened=false;
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
      $log.debug(selectedItem);
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
        $log.debug(res);
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
    $log.debug('newPrimary: ', $scope.newPrimary);

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
      $log.debug(primary);
      $log.debug($scope.dataset);
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
      PrimarySrv.delete({id: $scope.dataset.primary.id}, function(result){
        $log.debug(result);
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
    $log.debug($scope.dataset.primary);

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
      $log.debug(primary);
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
    PrimarySrv.sync(job, function(r){
      ngNotify.set('The primary source will be synchronised. ');
      $scope.dataset.primary.jobStatus = 'active';
      // Process response
      $log.debug('result', r);
    });
  };
  });
})();
