'use strict';

angular.module('columbyApp')
  .controller('AccountSelectorCtrl',
  function ($rootScope, $scope, $modalInstance, user) {

    console.log(user);
    $scope.user = $rootScope.user;
    console.log($scope.user);

    for (var i=0; i<$rootScope.user.accounts.length;i++){
      // set avatar url
      var account = $rootScope.user.accounts[ i];
      console.log(account);
      $scope.user.accounts[ i].avatar.url = $rootScope.config.filesRoot + '/a/' + account.avatar.shortid + '/' + account.avatar.filename;
    }

    $scope.selectAccount = function(item){
      console.log(item);
      $modalInstance.close(item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
