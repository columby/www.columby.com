(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('TagCtrl', function ($log,$scope, $stateParams, TagService) {

    function getDatasets(){
      $log.debug($stateParams);

      TagService.get({slug: $stateParams.slug}, function(result){
        $log.debug(result);
        $scope.tag = result;
      });
    }

    getDatasets();

  });
})();
