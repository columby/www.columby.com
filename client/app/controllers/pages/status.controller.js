'use strict';

angular.module('columbyApp')
  .controller('StatusCtrl', function ($rootScope, $scope, $http) {

    $rootScope.title = 'columby.com | Status';

    $scope.statusList = [
      {
        name: 'API',
        source: $rootScope.config.apiRoot,
        description: 'The columby api',
        status: false,
      },
      {
        name: 'Worker',
        source: $rootScope.config.workerRoot,
        description: 'The columby worker process',
        status: false,
      },
      {
        name: 'Files',
        source: $rootScope.config.filesRoot,
        description: 'The columby files server',
        status: false,
      },
    ]

    for (var i=0; i<$scope.statusList.length;i++){
      checkStatus({url:$scope.statusList[ i].source, index:i}, function(result){
        console.log(result);
        $scope.statusList[ result.index].status = result.status;
      })
    }

    function checkStatus(params,cb){
      $http.get(params.url).then(function(result){
        result.index = params.index;
        cb(result);
      });
    };
  });
