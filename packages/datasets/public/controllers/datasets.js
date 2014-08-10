'use strict';

angular.module('mean.datasets').controller('DatasetsController', ['$scope', '$state', 'Global', 'DatasetsSrv',
  function($scope, $state, Global, DatasetsSrv) {
    $scope.global = Global;
    $scope.package = {
      name: 'datasets'
    };
  }
]);


angular.module('mean.datasets').controller('DatasetViewCtrl', ['$scope', '$state', '$stateParams', 'DatasetsSrv',
  function($scope, $state, $stateParams, DatasetsSrv) {

    $scope.contentLoading = true;

    DatasetsSrv.retrieve($stateParams.datasetId).then(function(res){
      console.log('dataset', res);
      $scope.dataset = res;
      $scope.contentLoading = false;
    });
  }
]);

angular.module('mean.datasets').controller('DatasetCreateController', ['$scope', '$state', 'DatasetsSrv',
  function($scope, $state, DatasetsSrv) {

    $scope.package = { name: 'datasets'};

    console.log('DatasetsCreateController created');

    DatasetsSrv.create().then(function(res){
      console.log('dataset', res);
      if (res._id) {
        $state.go('dataset edit', {datasetId:res._id});
      } else {
        console.log('error or something', res);
      }
    });
  }
]);

angular.module('mean.datasets').controller('DatasetEditCtrl', ['$scope', '$state', '$stateParams', '$timeout', '$interval', 'DatasetsSrv',
  function($scope, $state, $stateParams, $timeout, $interval, DatasetsSrv) {

    $scope.isEmpty = function(obj) {
      return angular.equals({}, obj);
    };

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

        DatasetsSrv.autoSave(d).then(function(res){

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
    $scope.contentLoading = true;
    DatasetsSrv.retrieve($stateParams.datasetId).then(function(res){
      if (res._id) {
        console.log('Dataset received', res);
        $scope.dataset = res;

        // inititiate the draft master version (for reference)
        resetDrafts();

        // start the timer for autosave (notice: no check if server response is ok... )
        $interval(autoSave, 5000);
      } else {
        console.log('error or something', res);
      }
      $scope.contentLoading = false;
    });
  }
]);
