'use strict';

angular.module('columbyApp')

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountCtrl', function ($window, $rootScope, $scope, $stateParams, $state, ngNotify, AuthSrv, AccountSrv, CollectionSrv, DatasetSrv, UserSrv) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $rootScope.title = 'columby.com';
    $scope.datasets = {
      currentPage: 1,
      numberOfItems: 10
    };

    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */

    function getAccount() {
      console.log('Fetching account. ');
      // get account information of user by userSlug
      AccountSrv.get($stateParams.slug).then(function (result) {
        $scope.contentLoading = false;
        if (result.account.id) {

          $scope.account = result.account;

          // Set avatar url
          if ($scope.account.avatar) {
            $scope.account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.account.avatar.shortid + '/' + $scope.account.avatar.filename;
          }

          // Update window title
          $window.document.title = 'columby.com | ' + $scope.account.displayName;

          // Check permission
          if ($scope.account.primary){
            $scope.account.canEdit = AuthSrv.hasPermission('edit user', {slug:$scope.account.slug});
          } else {
            $scope.account.canEdit = AuthSrv.hasPermission('edit account', {slug:$scope.account.slug});
          }
          console.log($scope.account.canEdit);


          // Set header background image
          if ($scope.account.headerImg) {
            updateHeaderImage();
          }

          getCollections();
          getDatasets();
        } else {
          ngNotify.set('The requested account was not found. ','error');
          $state.go('home');
        }
      });
    }

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
        $scope.datasets.numPages = parseInt(d.count/$scope.datasets.numberOfItems + 1);
        $scope.datasets.loading = false;
      });

    }



    function updateHeaderImage(){
      $scope.account.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
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
      ngNotify.set('The requested account was not found. ','error');
      $state.go('home');
    } else {
      getAccount();
    }

});
