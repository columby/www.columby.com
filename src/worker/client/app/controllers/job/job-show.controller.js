'use strict';

angular.module('columbyworkerApp')

.controller('JobCtrl', function($log, $scope, WorkerService, $stateParams) {
  $log.debug($stateParams);
  WorkerService.job($stateParams.id).then(function(result){
    $log.debug(result);
    $scope.job = result;
  });
});
