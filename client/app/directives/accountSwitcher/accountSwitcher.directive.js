'use strict';

angular.module('columbyApp')
  .directive('accountSwitcher', function($rootScope, ngDialog, $state){
    return {
      templateUrl: 'app/directives/accountSwitcher/accountSwitcher.html',
      restrict: 'EA',
      scope: {
        accounts: '='
      },

      controller: function($scope){

        $scope.showPopup = function (){
          ngDialog.open({
            template: 'app/directives/accountSwitcher/accountSwitcherModal.html',
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
          //console.log($rootScope.selectedAccount.slug);
          $state.go('account.view', {slug:$rootScope.selectedAccount.slug });
          ngDialog.closeAll();
        };
      }
    };
  });
