(function() {
  'use strict';

  angular.module('columbyApp').controller('AccountCtrl', function(account, $rootScope, $scope, $stateParams, $state, ngNotify, AuthSrv, AccountSrv, DatasetSrv, appConstants, $log) {

    // Check if requested account was fetched
    if (!account.id){
      ngNotify.set('The requested account was not found. ','error');
      $state.go('home');
    }

    // Add account to scope
    $scope.account = account;

    // Update the avatar url based on the filename
    // if ($scope.account.avatar){
    //   $scope.account.avatar.url = appConstants.filesRoot + '/s/small/' + $scope.account.avatar.url;
    // }

    // Set page tittle based on result
    $rootScope.title = 'columby.com | ' + $scope.account.displayName;

    // Initial settings
    $scope.datasets = {
      currentPage: 1,
      numberOfItems: 10
    };
    $scope.search = {};

    // Set header background image
    if ($scope.account.headerImg) { updateHeaderImage(); }

    // check if current user can edit the account
    if ($scope.account.primary){
      $scope.account.canEdit = AuthSrv.hasPermission('edit user', account);
    } else {
      $scope.account.canEdit = AuthSrv.hasPermission('edit organisation', account);
    }

    // Selection filters
    $scope.showEmptyCategories = false;
    $scope.selectedCategory = false;



    function getDatasets() {
      $scope.datasets.loading = true;
      var options = {
        offset: ($scope.datasets.currentPage - 1) * 10,
        account_id: $scope.account.id,
      };
      if ($scope.search.term){
        options.search = $scope.search.term;
      }

      DatasetSrv.index(options, function (result) {
        $scope.datasets.rows = result.rows;
        $scope.datasets.count = result.count;
        $scope.datasets.numPages = parseInt(result.count/$scope.datasets.numberOfItems + 1);
        $scope.datasets.loading = false;
        $scope.search.query = null;
      });
    }


    function updateHeaderImage(){
      $log.debug($scope.account);
      $scope.account.headerImg.url = appConstants.filesRoot + '/s/large/' + $scope.account.headerImg.url;
      $scope.headerStyle={
        'background-image': 'linear-gradient(transparent,transparent), url(/assets/img/default-header-bw.svg), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }



    $scope.pageChanged = function() {
      getDatasets();
    };

    $scope.searchAccount = function() {
      $scope.search.term = $scope.search.query;
      getDatasets();
    };

    $scope.clearSearch = function(){
      $scope.datasets.currentPage = 1;
      $scope.search.term = null;
      getDatasets();
    };

    $scope.toggleEmptyCategories = function(){
      $scope.showEmptyCategories = !$scope.showEmptyCategories;
    };

    getDatasets();
  });
})();
