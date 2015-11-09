/***
 *
 * Edit a user account (primary)
 *
 ***/
 (function() {
   'use strict';

  angular.module('columbyApp')
  .controller('UserEditCtrl', function($log, $rootScope, $scope, $state, UserSrv, AccountSrv, ngNotify, Slug, $modal, appConstants, store) {

    // Set logged in user into scope
    $scope.user = $rootScope.user;

    // Set proper user avatar
    if (!$scope.user.primary.avatar) { $scope.user.primary.avatar = {}; }
    $scope.user.primary.avatar.url = appConstants.filesRoot + '/image/small/' + $scope.user.primary.avatar.filename;

    // Check for user's primary account
    if (!$scope.user.primary.id){
      $scope.errorMsg = 'There seems to be a problem with your account. Please contact support.';
    }

    // save a copy of the user object for reference
    $scope.originalUser = angular.copy($scope.user);

    // Set the default active panel
    $scope.activePanel = 'profile';

    // Change the active panel when a user clicks on a menu-link
    $scope.changePanel = function(panel) {
      $scope.activePanel = panel;
    };

    // Update user's primary account
    $scope.updateAccount = function(){
      $log.debug('updating account');
      $log.debug($scope.user.primary);
      // check for update
      if (angular.equals($scope.user.primary, $scope.originalUser.account) === false){
        // send to server
        AccountSrv.update({id: $scope.user.primary.id}, $scope.user.primary, function(result){
          $log.debug(result);
          if (result.statusCode===200){
            //$scope.account = result;
            $scope.originalUser = angular.copy($scope.user);
            ngNotify.set('Account updated.','notice');
            // Update user
            $rootScope.user = $scope.user;
            store.set('profile', $rootScope.user);
          } else {
            ngNotify.set('There was an error updating the account name.','error');
          }
        });
      }
    };


    // Delete a user account
    $scope.destroy = function(){
      var modalInstance = $modal.open({
        size: 'lg',
        templateUrl: 'views/user/deleteModal.html'
      }).result.then(function(){
        $scope.deletingUser = true;
        UserSrv.destroy($scope.user.id).then(function(result){
          if (result.status === 'success'){
            $state.go('home');
            ngNotify.set('You have succesfully deleted your account, thank you and see you next time. ', 'notice');
          }
        });
      },function(){
        ngNotify.set('There was an error', 'error');
      });
    };


    $scope.openFileBrowser = function() {
      $rootScope.$broadcast('openFileManager', {
        type:'image',
        account_id: $scope.user.primary.id,
        select: true,
        action: 'updateAvatar'
      });
    };

    $scope.$on('fileManagerSelected', function(event,data){
      $log.debug(event);
      $log.debug(data);
      if (data.action === 'updateAvatar') {
        $scope.user.primary.avatar_id = data.file.id;
        $scope.user.primary.avatar = data.file;
        $scope.updateAccount();
      }
    });


    // Update a slug input
    $scope.slugify = function() {
      $scope.user.primary.slug = Slug.slugify($scope.user.primary.slug);
    };

  });
})();
