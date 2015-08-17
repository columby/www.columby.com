(function() {
  'use strict';

  angular
    .module('columbyApp')
  .controller('AccountCtrl', function (account, $rootScope, $scope, $stateParams, $state, ngNotify, AuthSrv, AccountSrv, DatasetSrv, appConstants) {

    if (!account.id){
      ngNotify.set('The requested account was not found. ','error');
      $state.go('home');
    }
    $scope.account = account;
    if ($scope.account.avatar){
      $scope.account.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.account.avatar.filename;
    }

    $rootScope.title = 'columby.com | ' + $scope.account.displayName;

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
      $scope.account.headerImg.url = appConstants.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
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

    getDatasets();
  });
})();
