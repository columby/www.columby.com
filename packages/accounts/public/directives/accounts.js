'use strict';

angular.module('mean.accounts')

.directive('accountSwitcher', function($rootScope, $state){
  return {

    restrict: 'EA',
    scope: {
      accounts: '='
    },

    controller: function($scope){

      $scope.showSelector = false;

      $scope.showPopup = function (){
        $scope.showSelector = true;
      };

      $scope.closePopup = function() {
        $scope.showSelector = false;
      };

      $scope.addAccount = function() {
        $scope.showSelector = false;
        $state.go('account.create');
      };

      $scope.switchAccount = function(index){
        $rootScope.selectedAccount =  $scope.accounts[ index];
        $scope.showSelector = false;
      };
    },

    templateUrl: 'accounts/views/includes/accountSwitcher.html'
  };
});
