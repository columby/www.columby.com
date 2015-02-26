'use strict';

angular.module('columbyApp')
  .controller('TagCtrl', function ($scope, $stateParams, TagService) {

    function getDatasets(){
      console.log($stateParams);

      TagService.get({slug: $stateParams.slug}, function(result){
        result.datasets = result.tags;
        delete result.tags;

        $scope.tag = result;
        console.log($scope.tag);
      });
    }

    getDatasets();

  });
