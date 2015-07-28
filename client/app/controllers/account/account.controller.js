'use strict';

angular.module('columbyApp')

/**
 *
 * Account View Controller
 *
 **/
.controller('AccountCtrl', function (account, $window, $rootScope, $scope, $stateParams, $state, ngNotify, AuthSrv, AccountSrv, DatasetSrv, UserSrv) {

  if (!account.id){
    ngNotify.set('The requested account was not found. ','error');
    $state.go('home');
  }
  $scope.account = account;

  $rootScope.title = 'columby.com | ' + $scope.account.displayName;

  $scope.datasets = {
    currentPage: 1,
    numberOfItems: 10
  };

  // Set header background image
  if ($scope.account.headerImg) {
    updateHeaderImage();
  }

  getDatasets();

  // check if current user can edit the account
  if ($scope.account.primary){
    $scope.account.canEdit = AuthSrv.hasPermission('edit user', account);
  } else {
    $scope.account.canEdit = AuthSrv.hasPermission('edit organisation', account);
  }


  function getDatasets() {
    $scope.datasets.loading = true;
    var offset = ($scope.datasets.currentPage - 1) * 10;
    DatasetSrv.index({accountId: $scope.account.id, offset: offset}, function (d) {
      $scope.datasets.rows = d.rows;
      $scope.datasets.count = d.count;
      $scope.datasets.numPages = parseInt(d.count/$scope.datasets.numberOfItems + 1);
      $scope.datasets.loading = false;
    });
  }


  function updateHeaderImage(){
    $scope.account.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
    $scope.headerStyle={
      'background-image': 'linear-gradient(transparent,transparent), url(/assets/img/default-header-bw.svg), url(' + $scope.account.headerImg.url + ')',
      'background-blend-mode': 'multiply'
    };
  }


  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  $scope.pageChanged = function() {
    console.log('Page changed to: ' + $scope.datasets.currentPage);
    getDatasets();
  };
});
