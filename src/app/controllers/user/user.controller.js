(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('SigninCtrl', function ($log,$rootScope, $scope, $state, UserSrv, AuthSrv, ngNotify, $modal) {

  // Set page title
  $rootScope.title = 'Sign in | columby.com';

  // Check if user is not already logged in
  if (AuthSrv.isAuthenticated()) {
    $state.go('settings');
    ngNotify.set('You are already logged in.');
  }


  // Handle login authentication
  $scope.authenticate = function(provider){

    // Open up a loading modal
    var modal = $modal.open({
      size: 'lg',
      templateUrl: 'views/user/partials/modal-inprogress.html',
      controller: function(){ }
    });

    // Set the type of provider and necessary details.
    var provider = {
      service: provider,
      email: $scope.email,
      register: 'false'
    };

    // Authenticate with the authentication service.
    AuthSrv.authenticate(provider).then(function(response){
      $log.debug(response);
      modal.dismiss();

      if (response.status === 'warning'){
        ngNotify.set(response.msg, 'error');
      } else if (response.status === 'wrong_provider'){
        ngNotify.set(response.msg, 'error');
      } else if (response.status==="success") {
        // Handle email login
        if (provider.service === 'email'){
          if (response.status === 'success') {
            var successModal = $modal.open({
              size: 'lg',
              templateUrl: 'views/user/partials/modal-email-success.html',
            });
          }
        }
      } else if (response.user && response.user.id) {
        ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
        $state.go('home');
      } else if (response.status === 'not_found') {

        ngNotify.set('The email address ' + $scope.email + ' does not exist. Would you like to register for a new account?', 'warning');
        $scope.newuser={};
        $scope.newuser.email = $scope.email;

        var newmail = $scope.email.replace(/@.*$/,'').substring(0,20);
        for (var c=0; newmail.length < 3; c++) {
          newmail = newmail + c;
        }
        $scope.newuser.name = newmail;

      } else {
        ngNotify.set('Sorry, something went wrong... ' + JSON.stringify(response.err), 'error');
      }
    });
  };
});
})();


/***
 *
 * Check if user sent a verification token with page request.
 *
 ***/
 (function() {
   'use strict';

   angular
     .module('columbyApp')
     .controller('UserVerifyCtrl', function($rootScope, $scope,$location, $state, UserSrv, ngNotify){

  var token = $location.search().token;

  UserSrv.verify(token).then(function(result){
    if (result.status==="error") {
      $scope.message = result.err;
      ngNotify.set('There was an error verifying the login. Please try again.', 'error');
      delete $scope.verificationInProgress;
    } else if ( (result.user) && (result.user.id) ) {
      ngNotify.set('You have succesfully signed in.');
      $state.go('home');
    }
  });
});
})();


/***
 *
 * Register controller for a new user.
 *
 ***/
 (function() {
   'use strict';

   angular
     .module('columbyApp')
     .controller('RegisterCtrl', function($log,$window, $scope, $rootScope, $location, $http, $state, AccountSrv, UserSrv, ngNotify, Slug, AuthSrv,$modal) {

  $rootScope.title = 'Register | columby.com';

  // if user is already logged in
  if($rootScope.user.id){
    ngNotify.set('You are already logged in.', 'error');
    $state.go('settings');
  }

  $scope.register = function(provider){

    // Open up a loading modal
    var modal = $modal.open({
      size: 'lg',
      templateUrl: 'views/user/partials/modal-inprogress.html',
      controller: function(){ }
    });

    // Set the type of provider and necessary details.
    var provider = {
      service: provider,
      email: $scope.newuser.email,
      displayName: $scope.newuser.name,
      register: 'true'
    };

    $log.debug('p', provider);

    AuthSrv.authenticate(provider).then(function(response){

      $log.debug(response);
      if (response.status === 'warning'){
        ngNotify.set(response.msg, 'error');
        modal.dismiss();
      } else if (response.user.id) {
        ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
        $state.go('settings');
      }

    });
  };

  $scope.slugifyName = function(){
    if ($scope.newuser.name){
      var n = Slug.slugify($scope.newuser.name);
      while(n.length<3){
        n = n+'-';
      }
      $scope.newuser.name = n;
    }
  };
});
})();

(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('UserViewCtrl', function($log,$window, $rootScope, $scope, $stateParams, AuthSrv, UserSrv, AccountSrv) {
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


/***
 *
 * Edit a user account
 *
 ***/
 (function() {
   'use strict';

   angular
     .module('columbyApp')
     .controller('UserEditCtrl', function($log,user, $scope, $rootScope, $location, $state, $stateParams, UserSrv, AccountSrv, ngNotify, Slug, $modal) {

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
