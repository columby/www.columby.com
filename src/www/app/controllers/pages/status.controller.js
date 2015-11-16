(function() {
  'use strict';

  angular
    .module('ng-app')
    .controller('StatusCtrl', function($log,$rootScope, $scope, $http,appConstants) {

    $scope.ckan = {
      action: 'dashboard_activity_list_html'
    };

    $scope.ckanQuery = function(){

      var params = {
        action: $scope.ckan.action
      };

      $http({
        method: 'GET',
        url: appConstants.apiRoot + '/v2/registry/ckan',
        params: params
      }).then(function(result){
        $log.debug(result);
        $scope.ckan.result = JSON.parse(result.data.body).result;
        $scope.ckan.error = result.data.error;
      }).catch(function(err){
        $log.debug(err);
      });
    };


    $rootScope.title = 'columby.com | Status';

    $scope.statusList = [
      {
        name: 'API',
        source: appConstants.apiRoot,
        description: 'The columby api',
        status: false,
      },
      {
        name: 'Worker',
        source: appConstants.workerRoot,
        description: 'The columby worker process',
        status: false,
      },
      {
        name: 'Files',
        source: appConstants.filesRoot,
        description: 'The columby files server',
        status: false,
      },
    ];

    for (var i=0; i<$scope.statusList.length;i++){
      checkStatus({url:$scope.statusList[ i].source, index:i}, function(result){
        $log.debug(result);
        $scope.statusList[ result.index].status = result.status;
      });
    }

    function checkStatus(params,cb){
      $http.get(params.url).then(function(result){
        result.index = params.index;
        cb(result);
      });
    }
  });
})();
