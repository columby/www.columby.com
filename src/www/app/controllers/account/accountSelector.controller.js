(function () {
  'use strict';

  angular.module('ng-app')

    .controller('AccountSelectorCtrl',

    function (organisations, selectedAccount, $rootScope, $scope, $modalInstance) {
      // initialize the scope
      $scope.selectedAccount = selectedAccount;
      $scope.organisations = organisations;

      $scope.selectAccount = function (account) {
        $modalInstance.close(account);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  );
})();
