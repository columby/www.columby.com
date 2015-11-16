(function() {
  'use strict';

  angular.module('ng-app')
  .controller('TagCtrl', function ($log,$scope, $stateParams, TagService) {

    $scope.pagination = {
      currentPage: 1,
      numberOfItems: 10,
      numPages: 1,
      offset:0
    };

    function getDatasets(){
      var options = {
        offset: ($scope.pagination.currentPage - 1) * $scope.pagination.numberOfItems,
        slug: $stateParams.slug
      };

      TagService.get(options, function(result){
        $log.debug(result);
        // Set number of pagination pages based on result
        $scope.pagination.numPages = parseInt(result.hits.datasets.count/$scope.pagination.numberOfItems + 1);
        // Add result to the scope
        $scope.tag = result;
      });
    }

    $scope.pageChanged = function() {
      delete $scope.tag;
      getDatasets();
    };

    getDatasets();

  });
})();
