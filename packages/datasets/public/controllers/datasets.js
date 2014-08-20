'use strict';

angular.module('mean.datasets').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

angular.module('mean.datasets').controller('DatasetsController', ['$scope', '$state', 'Global', 'DatasetSrv',
  function($scope, $state, Global, DatasetSrv) {
    $scope.global = Global;
    $scope.package = {
      name: 'datasets'
    };
  }
]);


angular.module('mean.datasets').controller('DatasetViewCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'DatasetSrv', 'MetabarSrv', 'ColumbyAuthSrv', 'FlashSrv',
  function($rootScope, $scope, $state, $stateParams, DatasetSrv, MetabarSrv, ColumbyAuthSrv, FlashSrv) {

    /***   INITIALISATION   ***/
    var editWatcher;               // Watch for model changes in editmode

    $scope.contentLoading = true;  // show loading message while loading dataset
    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode

    /***   FUNCTIONS   ***/
    function getDataset(){

      DatasetSrv.get({
        datasetId: $stateParams.datasetId
      }, function(dataset) {
        console.log(dataset);
        $scope.dataset = dataset;
        $scope.contentLoading = false;
        // send metadata to the metabar
        var meta = {
          postType: 'dataset',
          _id: dataset._id,
          user: dataset.user,
          created: dataset.created,
          updated: dataset.updated,
          canEdit: ColumbyAuthSrv.canEdit(dataset)
        };
        MetabarSrv.setPostMeta(meta);
      });
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

      console.log('Sending update', dataset);

      DatasetSrv.update(dataset,function(res){
        console.log(res);
        if (res._id){
          $scope.dataset = res;
          FlashSrv.setMessage({
            value: 'Dataset udated!',
            status: 'info'
          });
          $scope.toggleEditMode();
        }
      });
    };

    /*** ROOTSCOPE EVENTS ***/
    // Turn on or off editMode for a dataset
    $scope.$on('metabar::editMode', function(evt,mode){
      console.log('editmode on');
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
    getDataset();
  }
]);

angular.module('mean.datasets').controller('DatasetCreateController', ['$rootScope', '$scope', '$state', 'DatasetSrv',
  function($rootScope, $scope, $state, DatasetSrv) {

    var dataset = new DatasetSrv({
      title: 'New dataset'
    });

    dataset.$save(function(res){
      console.log('dataset', res);
      if (res._id) {
        $state.go('dataset view', {datasetId:res._id});
      } else {
        console.log('error or something', res);
      }
    });
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
