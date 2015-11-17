(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('CollectionsCtrl', function ($rootScope, $scope, CollectionSrv) {

    $scope.collections = CollectionSrv.index();

  });
})();

(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('CollectionCtrl', function ($rootScope, $scope, $stateParams, CollectionSrv, UserSrv,appConstants) {

    // Initiate pagination
    $scope.pagination = {
      count: 0,
      numPages: 0,
      itemsPerPage: 10,
      currentPage: 1,
      rowsPerPage: 10
    };

    // Get the collection
    function getCollection(){

      $scope.contentLoading = true;

      // Get collection
      CollectionSrv.show({id:$stateParams.id }, function(result){

        // restructure result
        result.account = result.Account;
        delete result.Account;
        result.account.avatar.url = appConstants.filesRoot + '/a/' + result.account.avatar.shortid + '/' + result.account.avatar.filename;

        // Add collection to the scope
        $scope.collection = result;

        // Check access
        $scope.collection.canEdit= UserSrv.canEdit('collection', result);

        // Turn off loader
        $scope.contentLoading = false;

        // Get Datasets
        getDatasets({id:$scope.collection.id});
      });
    }

    // Get datasets for the collection
    function getDatasets() {
      $scope.datasetsLoading = true;
      var offset = ($scope.pagination.currentPage - 1) * $scope.pagination.rowsPerPage;

      CollectionSrv.getDatasets({
        id: $scope.collection.id,
        offset: offset
      }, function(result){
        $scope.collection.datasets = result.rows;
        $scope.pagination.count = result.count;
        $scope.pagination.numPages = Math.ceil(parseInt($scope.pagination.count, 10) / parseInt($scope.pagination.rowsPerPage, 10));
        $scope.datasetsLoading = false;
      });
    }

    // Handle pagination change
    $scope.pageChanged = function() {
      getDatasets();
    };

    // Initiate the page
    getCollection();

  });
})();
