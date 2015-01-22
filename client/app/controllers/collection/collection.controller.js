'use strict';

angular.module('columbyApp')

  .controller('CollectionIndexCtrl', function ($scope, CollectionSrv) {

    $scope.collections = CollectionSrv.index();

  })

  .controller('CollectionViewCtrl', function ($scope, $stateParams, AuthSrv, CollectionSrv) {

    CollectionSrv.show({id:$stateParams.id }, function(result){
      console.log(result);
      $scope.collection = result;
      $scope.collection.canEdit= AuthSrv.canEdit('collection', result);
    });

  })

;
