'use strict';

angular.module('mean.accounts')

.directive('accountSwitcher', function($rootScope, ngDialog, $state){
  return {

    restrict: 'EA',
    scope: {
      accounts: '='
    },

    controller: function($scope){

      $scope.showPopup = function (){
        ngDialog.open({
          template: 'accounts/views/includes/accountSwitcherModal.html',
          className: 'ngdialog-theme-default',
          scope: $scope
        });
      };

      $scope.addAccount = function() {
        ngDialog.closeAll();
        $state.go('account.create');
      };

      $scope.switchAccount = function(index){
        $rootScope.selectedAccount =  $scope.accounts[ index];
        ngDialog.closeAll();
      };
    },

    templateUrl: 'accounts/views/includes/accountSwitcher.html'
  };
});
