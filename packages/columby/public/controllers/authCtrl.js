'use strict';

angular.module('mean.columby')


  .controller('AccountCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'AuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, AuthSrv, FlashSrv) {

    /*** FUNCTIONS ***/
    function getAccount(){
      AuthSrv.getAccount().then(function(account){
        $scope.account = account;
      });
    }

    $scope.logout = function(){
      console.log('logging out');
      AuthSrv.logout().then(function(result){
        localStorage.removeItem('auth_token');
        $rootScope.user = {};
        FlashSrv.setMessage({
          value: 'You are now signed out.',
          status: 'info'
        });

        $state.go('home');
      });
    };

    $scope.updateAccount = function(){
      var update = {
        username: $scope.account.username,
        email: $scope.account.email
      };
      var id = $scope.account._id;
      delete update._id;

      AuthSrv.updateAccount(id, update).then(function(res){
        $rootScope.$broadcast('account::updated');
        FlashSrv.setMessage({
          value: 'Account updated',
          status: 'info'
        });

      });
    };

    /*** INIT ***/
    getAccount();

  }])

;
