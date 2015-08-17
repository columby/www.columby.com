'use strict';

angular.module('columbyApp')
  .controller('TagCtrl', function ($scope, $stateParams, TagService) {

    function getDatasets(){
      $log.debug($stateParams);

      TagService.get({slug: $stateParams.slug}, function(result){
        result.datasets = result.tags;
        delete result.tags;

        $scope.tag = result;
        $log.debug($scope.tag);
      });
    }

    getDatasets();

  });
