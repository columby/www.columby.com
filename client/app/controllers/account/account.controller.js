'use strict';

angular.module('columbyApp')

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountCtrl', function ($window, $rootScope, $scope, $stateParams, $state, toaster, AccountSrv, AuthSrv, CollectionSrv, DatasetSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $window.document.title = 'columby.com';
    $scope.datasets = {
      currentPage: 1,
      numberOfItems: 10
    };

    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getCollections() {
      //if ($scope.account.collections && $scope.account.collections.length > 0) {
      //  $scope.account.collections = [];
      //  angular.forEach($scope.account.Collections, function (value, key) {
      //    CollectionSrv.get({id: value.shortid}, function (result) {
      //      $scope.account.collections[key] = result;
      //    });
      //  });
      //  delete $scope.account.Collections;
      //  console.log($scope.account.collections);
      //} else {
      //  //console.log('no collections');
      //}
      $scope.account.collections = $scope.account.Collections;
      delete $scope.account.Collections;
    }

    function getDatasets() {
      $scope.datasets.loading = true;
      var offset = ($scope.datasets.currentPage - 1) * 10;
      DatasetSrv.index({accountId: $scope.account.id, offset: offset}, function (d) {
        $scope.datasets.rows = d.rows;
        $scope.datasets.count = d.count;
        $scope.datasets.loading = false;
      });

    }

    function getAccount() {
      // get account information of user by userSlug
      AccountSrv.get({slug: $stateParams.slug}, function (result) {
        if (!result.id) {
          toaster.pop('warning', null, 'The requested account was not found. ');
          $state.go('home');
        } else {
          $scope.account = result;
          if ($scope.account.avatar) {
            $scope.account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.account.avatar.shortid + '/' + $scope.account.avatar.filename;
          }
          $scope.contentLoading = false;
          $window.document.title = 'columby.com | ' + result.name;

          $scope.account.canEdit = AuthSrv.canEdit('account', result);

          if ($scope.account.headerImg) {
            updateHeaderImage();
          }

          getCollections();
          getDatasets();
        }
      });

    }
    function updateHeaderImage(){
      $scope.account.headerImg.url = $rootScope.config.apiRoot + '/v2/file/' + $scope.account.headerImg.id + '?style=large';
      $scope.headerStyle={
        'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.datasets.currentPage);
      getDatasets();
    };

    /* ---------- INIT ----------------------------------------------------------------------------- */
    if (!$stateParams.slug){
      toaster.pop('warning', null, 'The requested account was not found. ');
      $state.go('home');
    } else {
      getAccount();
    }

});
