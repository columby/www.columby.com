'use strict';

angular.module('columbyApp')

  .controller('CollectionsCtrl', function ($rootScope, $scope, CollectionSrv) {

    $scope.collections = CollectionSrv.index();

  })

  .controller('CollectionCtrl', function ($rootScope, $scope, $stateParams, AuthSrv, CollectionSrv) {

    $scope.contentLoading = true;

    // Get collection
    CollectionSrv.show({id:$stateParams.id }, function(result){

      // restructure result
      result.account = result.Account;
      delete result.Account;
      result.datasets = result.Datasets;
      delete result.Datasets;
      result.account.avatar.url = $rootScope.config.filesRoot + '/a/' + result.account.avatar.shortid + '/' + result.account.avatar.filename;
      // Add collection to the scope
      $scope.collection = result;

      // Check access
      $scope.collection.canEdit= AuthSrv.canEdit('collection', result);

      // Turn off loader
      $scope.contentLoading = false;
    });

  })

;
