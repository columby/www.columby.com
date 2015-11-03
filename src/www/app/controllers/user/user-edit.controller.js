/***
 *
 * Edit a user account
 *
 ***/
 (function() {
   'use strict';

  angular.module('columbyApp').controller('UserEditCtrl', function($log,user, $scope, $rootScope, $location, $state, $stateParams, UserSrv, AccountSrv, ngNotify, Slug, $modal,appConstants) {

    user.primary.avatar.url = appConstants.filesRoot + '/image/small/' + user.primary.avatar.filename;
    $log.debug('User edit controller',user);

  // Set the default active panel
  $scope.activePanel = 'profile';

  $scope.user = user;
  //
  if (!$scope.user.primary.id){
    $scope.errorMsg = 'There seems to be a problem with your account. Please contact support.';
  }

  // save a copy for reference
  $scope.originalUser = angular.copy($scope.user);


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
        } else {
          ngNotify.set('There was an error updating the account name.','error');
        }
      });
    }
  };

  // Change the active panel when a user clicks on a menu-link
  $scope.changePanel = function(panel) {
    $scope.activePanel = panel;
  };

  // Logout the current user
  $scope.logout = function() {
    UserSrv.logout();
    ngNotify.set('You are now signed out.');
    $state.go('home');
  };


  // Delete an account
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

  // Update a slug at the server.
  $scope.updateSlug = function() {
    $scope.updatingSlug = true;

    AccountSrv.update($scope.user.primary).then(function(result){
      delete $scope.updatingSlug;
      if (result.id){
        $scope.originalUser.primary.slug = $scope.user.primary.slug;
        ngNotify.set('Account url updated. ', 'info');
      } else {
        ngNotify.set('There was a problem: ' + result.msg[ 0].message, 'error');
        $scope.user.primary.slug = $scope.originalUser.primary.slug;
      }
    });
  };
});
})();
