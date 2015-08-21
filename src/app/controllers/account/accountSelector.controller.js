(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('AccountSelectorCtrl',
  function ($rootScope, $scope, $modalInstance, organisations) {

    $scope.organisations = organisations;

    $scope.selectAccount = function(item){
      $modalInstance.close(item);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
);
})();
