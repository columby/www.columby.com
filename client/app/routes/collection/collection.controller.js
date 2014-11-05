'use strict';

angular.module('columbyApp')

  .controller('CollectionIndexCtrl', function ($scope, CollectionSrv) {

    $scope.collections = CollectionSrv.index();

  })

  .controller('CollectionViewCtrl', function ($scope, $stateParams, CollectionSrv) {
    console.log($stateParams);

    $scope.collection = CollectionSrv.show({id:$stateParams.id });

  })

;
