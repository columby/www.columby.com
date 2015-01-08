angular.module('columbyApp')
  .controller('AccountSelectorCtrl',
  function ($scope, $modalInstance, user) {

    $scope.user = user;

    $scope.selectAccount = function(item){
      console.log(item);
      $modalInstance.close(item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
