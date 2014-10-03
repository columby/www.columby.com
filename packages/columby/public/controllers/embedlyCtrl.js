'use strict';

angular.module('mean.columby')

.controller('EmbedlyCtrl', [
  '$rootScope', '$scope', 'EmbedlySrv',
  function($rootScope, $scope, EmbedlySrv) {

    $scope.validRequest = false;

    $scope.checkUrl = function() {

      $scope.errorMessage = null;
      $scope.embedlyResult = null;

      EmbedlySrv.extract($scope.embedlyUrl)
        .then(function(result){
          console.log('ress', result);
          $scope.embedlyResult = result;
          $scope.validRequest = true;

        }, function(err){
          console.log('err', err);
          $scope.errorMessage = err;
          $scope.embedlyUrl = null;

      });
    };

    $scope.addReference = function(){

      console.log('adding reference');
      $rootScope.$broadcast('embedly::new', $scope.embedlyResult);

      $scope.errorMessage = null;
      $scope.embedlyResult = null;
      $scope.embedlyUrl = null;
    };
  }
]);
