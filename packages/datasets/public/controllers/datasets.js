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
    //var editWatcher;               // Watch for model changes in editmode

    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode

    // check if request is for edit mode
    if ($state.current.data && $state.current.data.editMode) {
      $scope.editMode = true;
    }


    /***   FUNCTIONS   ***/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset

      DatasetSrv.get({
        datasetId: $stateParams.datasetId
      }, function(dataset) {
        // add acquired dataset to the scope
        $scope.dataset = dataset;
        $scope.contentLoading = false;
        if (!$scope.dataset.draft){
          $scope.dataset.draft={};
        }

        // create summary
        var summary = '<p>';
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

        $scope.dataset.canEdit = (dataset.account._id === $rootScope.selectedAccount._id);

      });
    }

    function initiateNewDataset(){
      $scope.dataset = {
        title: 'New title',
        description: '<p>Description</p>',
        publishStatus: 'unpublished',
        draft:{},
        account: $rootScope.selectedAccount._id
      };
    }

    function toggleEditMode(mode){
      if (!mode){
        $scope.editMode = !$scope.editMode;
      } else if (mode===true) {
        $scope.editMode = mode;
        // watch title change
        $scope.$watch('dataset.title', function(newVal, oldVal) {
          if (newVal !== oldVal){
            var dataset = {
              _id: $scope.dataset._id,
              title: newVal
            };

            DatasetSrv.update(dataset,function(res){
              if (res._id){
                toaster.pop('success', 'Updated', 'Dataset updated.');
              }
            });
          }
        });

      } else if (mode===false) {
        $scope.editMode = mode;
        // turn watching off.
        //editWatcher();
        $rootScope.$broadcast('editMode::false');
      }
    }

    /***   SCOPE FUNCTIONS   ***/
    $scope.edit = function(){
      toggleEditMode(true);
    };

    $scope.cancelEdit = function(){
      toggleEditMode(false);
    };

    $scope.updateDescription = function() {
      var dataset = {
        _id: $scope.dataset._id,
        description: $scope.dataset.description
      };

      DatasetSrv.update(dataset,function(res){
        if (res._id){
          toaster.pop('success', 'Updated', 'Dataset description updated.');
        }
      });
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
          toggleEditMode();
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

    $scope.openDatasourceModal = function() {
      $scope.addDatasource = true;
    };

    $scope.closeDatasourceModal = function() {
      $scope.addDatasource = false;
    };

    $scope.attachDatasourceLink = function() {
      //$scope.newDatasetSource = null;
      // validate link

      // add link to model
      if (!$scope.dataset.hasOwnProperty('sources')) {
        $scope.dataset.sources = [];
      }
      if ($scope.newDatasetSource){
        console.log('new', typeof($scope.dataset.sources));
        $scope.dataset.sources.push({
          uploader    : 'user_id',
          sourceType  : 'link',
          source      : $scope.newDatasetSource,
          status      : 'public'
        });

        DatasetSrv.update($scope.dataset,function(res){
          if (res._id){
            $scope.dataset = res;
            toaster.pop('success', 'Updated', 'Dataset updated.');
            //toggleEditMode();
            $scope.addDatasource = false;
          }
        });

        //$scope.newDatasetSource = null;
        //$scope.addDatasource = false;
      }

    };

    /*** ROOTSCOPE EVENTS ***/

    /*** INIT ***/
    if (!$scope.editMode) {
      getDataset();
    } else {
      initiateNewDataset();
      toggleEditMode(true);
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
