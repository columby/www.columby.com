'use strict';

angular.module('columbyApp')

/**
 *
 *  Controller for a dataset Edit page
 *
 */
.controller('DatasetEditCtrl', function(dataset, $rootScope, $scope, configSrv, $state, $stateParams, AccountSrv, DatasetSrv, DistributionSrv, PrimaryService, ReferenceSrv, TagService, Slug, FileSrv,ngProgress, $timeout,$modal,Upload, ngNotify, AuthSrv) {

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


  // Initialisation
  $scope.dataset = dataset;
  var modalOpened = false;
  $rootScope.title = 'columby.com | ' + dataset.title;
  // Make sure there is a reference array
  $scope.dataset.references = $scope.dataset.references || [];
  // Copy the values to detect changes later
  $scope.datasetOriginal = angular.copy($scope.dataset);
  // Update the header image
  if ($scope.dataset.headerImg && $scope.dataset.headerImg.id) {
    updateHeaderImage();
  }


  // Show or hide the options menu
  $scope.showOptions = function(){
    console.log(AccountSrv.get({slug:dataset.account.slug}).$promise);
    var modalInstance = $modal.open({
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
    })
  };


  /**
   *
   * Update an existing dataset.
   *
   */
  $scope.update = function(){
    // check for change
    var changed = !angular.equals($scope.datasetOriginal, $scope.dataset);
    console.log('Dataset changed: ' + changed);
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
    console.log('edit reference', reference);
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

  /**
   *
   * Delete an attached reference
   *
   */
  $scope.deleteReference = function(reference){
    var idx = $scope.dataset.references.indexOf(reference);
    console.log(reference);
    ReferenceSrv.delete({id:reference.id}, function(res){
      console.log(res);
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


  // $scope.closeDialog = function(){
  //   ngDialog.closeAll();
  // };


  $scope.addTag = function(tag){
    console.log($scope.dataset.id);
    console.log(tag);
    DatasetSrv.addTag({
      id: $scope.dataset.id,
      tag: tag
    }, function(result){
        console.log('dtaset addtag result: ', result);
    });
  };


  $scope.removeTag = function(tag){
    console.log('removing tag, ', tag);
    var id = $scope.dataset.tags.indexOf(tag);
    console.log(tag);
    DatasetSrv.removeTag({id:$scope.dataset.id, tid:tag.id},function(result){
      console.log('dataset remove result: ', result);
    });
  };

  $scope.showOptions();

});
