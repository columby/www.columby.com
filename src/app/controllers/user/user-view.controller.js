(function() {
  'use strict';

  angular.module('columbyApp').controller('UserViewCtrl', function($log,$window, $rootScope, $scope, $stateParams, AuthSrv, UserSrv, AccountSrv) {
    $log.debug('User view controller');
    
    $scope.contentLoading  = true;
    $rootScope.title = 'columby.com';
    $scope.datasets = {
      currentPage: 1,
      numberOfItems: 10
    };

    function fetchAccount(){
      $scope.contentLoading = false;
      AccountSrv.get($stateParams.slug).then(function(user){
        $scope.user = user.account;

        // Update window title
        $rootScope.title = 'columby.com | ' + $scope.user.displayName;

        // Check permission
        $scope.user.canEdit = AuthSrv.hasPermission('edit user', {slug:$scope.user.slug});

        // Set header background image
        if ($scope.user.headerImg) {
          //updateHeaderImage();
        }

      });
    }

    fetchAccount();
  });
})();
