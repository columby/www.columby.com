'use strict';

angular.module('mean.datasets').controller('DatasetsController', ['$scope', '$state', 'Global', 'DatasetSrv',
  function($scope, $state, Global, DatasetSrv) {
    $scope.global = Global;
    $scope.package = {
      name: 'datasets'
    };
  }
]);


angular.module('mean.datasets').controller('DatasetViewCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'DatasetSrv', 'MetabarSrv', 'AuthSrv', 'toaster',
  function($rootScope, $scope, $state, $stateParams, DatasetSrv, MetabarSrv, AuthSrv, toaster) {

    /***   INITIALISATION   ***/
    var editWatcher;               // Watch for model changes in editmode

    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode

    if ($state.current.data && $state.current.data.editMode) {
      $scope.editMode = true;
    }
    /***   FUNCTIONS   ***/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset

      DatasetSrv.get({
        datasetId: $stateParams.datasetId
      }, function(dataset) {

        $scope.dataset = dataset;
        $scope.contentLoading = false;
        if (!$scope.dataset.draft){
          $scope.dataset.draft={};
        }

        // create summary
        var summary = '<h3>Summary</h3><p>';
        // check for file source
        if (!dataset.sources) {
          summary += 'There is no data for this dataset available yet. ';
        } else if (!dataset.sources.primary) {
          summary += 'There is no primary source for this dataset yet. ';
        } else if (dataset.sources.primary.type) {
          summary += 'This dataset if of the type <strong>' + dataset.sources.primary.type + '</strong>.';
        }
        // check for license
        if (!dataset.license) {
          summary += 'There is no license defined. ';
        } else {
          summary += 'The licens for this dataset is <strong>' + dataset.license.name + '</strong>';
        }
        $scope.summary = summary + '</p>';

        console.log(summary);
        // send metadata to the metabar
        var meta = {
          postType: 'dataset',
          _id: dataset._id,
          publisher: dataset.publisher,
          created: dataset.created,
          updated: dataset.updated,
        };
        meta.canEdit = AuthSrv.canEdit(meta);
        MetabarSrv.setPostMeta(meta);

      });
    }

    function initiateNewDataset(){
      $scope.dataset = {
        title: 'New title',
        description: 'Description',
        publishStatus: 'unpublished',
        draft:{},
        publisherType: 'User',
        publisher: $rootScope.user.account._id
      };
    }


    /***   SCOPE FUNCTIONS   ***/
    $scope.toggleEditMode = function(){

      $scope.editMode = !$scope.editMode;
      // send closed message to metabar
      if ($scope.editMode === false) {
        $rootScope.$broadcast('editMode::false');
      }
    };

    $scope.update = function(){

      var dataset = {
        _id: $scope.dataset._id,
        title: $scope.dataset.title,
        description: $scope.dataset.description
      };

      DatasetSrv.update(dataset,function(res){
        if (res._id){
          $scope.dataset = res;
          toaster.pop('success', 'Updated', 'Dataset updated.');
          $scope.toggleEditMode();
        }
      });
    };

    $scope.create = function(){
      DatasetSrv.save($scope.dataset, function(res){
        if (res._id) {
          toaster.pop('success', 'Created', 'Dataset created.');
          $state.go('dataset.view', {datasetId:res._id});
        }
      });
    };

    /*** ROOTSCOPE EVENTS ***/
    // Turn on or off editMode for a dataset
    $scope.$on('metabar::editMode', function(evt,mode){
      $scope.editMode = mode;

      if (mode === true){
        // turn edit mode on
        editWatcher = $scope.$watchCollection('dataset', function (newval, oldval) {
          if (!angular.equals(oldval, newval)) {
            $scope.contentEdited = true;
          }
        });
      } else {
        // turn watching off.
        editWatcher();
      }
    });



    /*** INIT ***/
    if (!$scope.editMode) {
      getDataset();
    } else {
      initiateNewDataset();
      $rootScope.$broadcast('metabar::editMode', true);
    }
  }
]);


angular.module('mean.datasets').controller('DatasetEditCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$interval', 'DatasetSrv',
  function($scope, $state, $stateParams, $timeout, $interval, DatasetSrv) {

    /*** SCOPE INITIALIZATION ***/
    $scope.contentLoading = true;

    /*** VARIABLES ***/
    var autoSaveTimer;


    $scope.isEmpty = function(obj) {
      return angular.equals({}, obj);
    };

    /*** FUNCTIONS ***/
    function autoSave() {
      console.log('Starting autosave');
      // check for changes in the model
      if ($scope.draftWorking.description === '') {
        delete $scope.draftWorking.description;
      }

      if (!angular.equals($scope.draftMaster, $scope.draftWorking)) {

        $scope.autosaveInProgress = true;

        var d = {
          id: $scope.dataset._id,
          draft: $scope.draftWorking
        };

        DatasetSrv.autoSave(d).then(function(res){

          console.log('Autosave response', res);
          // Update the main dataset
          if (res.draft === null ) {
            res.draft = {};
          }
          $scope.dataset = angular.copy(res);
          console.log('res', $scope.dataset);
          // update the master copy with the received values, or the published values
          resetDrafts();

          $scope.autosaveInProgress = false;
        });
      }
    }

    function startAutoSave(){
      autoSaveTimer = $interval(autoSave, 5000);
    }
    function stopAutoSave(){
      if (angular.isDefined(autoSaveTimer)) {
        $interval.cancel(autoSaveTimer);
        autoSaveTimer = undefined;
      }
    }
    function resetDrafts(){
      console.log('updating draft models');

      if (!$scope.dataset.draft) $scope.dataset.draft = {};

      $scope.draftMaster = {};
      $scope.draftWorking = {};

      $scope.draftMaster.title = $scope.dataset.draft.title || $scope.dataset.title || null;
      $scope.draftMaster.description = $scope.dataset.draft.description || $scope.dataset.description || null;
      $scope.draftWorking = angular.copy($scope.draftMaster);
      console.log('draftMaster', $scope.draftMaster);
      console.log('draftWorking', $scope.draftWorking);
    }

    // Load dataset
    function loadDataset(){
      DatasetSrv.retrieve($stateParams.datasetId).then(function(res){
        if (res._id) {
          console.log('Dataset received', res);
          $scope.dataset = res;

          // inititiate the draft master version (for reference)
          resetDrafts();

          // start the timer for autosave (notice: no check if server response is ok... )
          startAutoSave();

          // Open sidebar
          angular.element('.editorSidebar').addClass('isOpen');
          angular.element('body').addClass('editorSidebarOpen');

        } else {
          console.log('error or something', res);
        }

        $scope.contentLoading = false;
      });
    }

    /*** ROOTSCOPE EVENTS ***/
    $scope.$on('stopAutosave', stopAutoSave());

    /*** INIT ***/
    loadDataset();
  }
]);
