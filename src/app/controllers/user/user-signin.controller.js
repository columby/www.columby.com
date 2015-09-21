(function() {
  'use strict';

  angular.module('columbyApp')
  .controller('UserSigninCtrl', function ($log,$rootScope, $scope, $state, UserSrv, AuthSrv, ngNotify, $modal, $timeout) {

    // Set page title
    $rootScope.title = 'Sign in | columby.com';

    // Check if user is not already logged in
    if (AuthSrv.isAuthenticated()) {
      $state.go('user.edit');
      ngNotify.set('You are already logged in.');
    }

    $scope.hideMessage = function(){
      delete $scope.msg;
    };

    // Handle login authentication
    $scope.authenticate = function(p){
      $scope.message = '<p class="bg-info"><i class="fa fa-spinner fa-spin"></i> Signing in</p>';

      // Set the type of provider and necessary details.
      var provider = {
        service: p,
        email: $scope.email,
        register: 'false'
      };

      // Authenticate with the authentication service.
      AuthSrv.authenticate(provider).then(function(response){
        $log.debug(response);

        // Handle oauth login
        if (response.user && response.user.id) {
          ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
          $state.go('home');
        }

        // Handle email login
        else if ((response.status==='success') && (provider.service === 'email')) {
          $scope.message = '<p class="bg-success">The authentication was successful. You should receive a login link in your inbox any moment.</p>';
        }

        // Handle wrong provider
        else if (response.status === 'wrong_provider'){
          $scope.message = '<p class="bg-danger">' + response.msg + '</p>';
        }

        // Handle user not yet registered
        else if (response.status === 'not_found') {
          $scope.message = '<p class="bg-danger">The email address ' + $scope.email + ' is not yet registered at Columby</p>';

          $scope.newuser={};
          $scope.newuser.email = $scope.email;

          var newmail = $scope.email.replace(/@.*$/,'').substring(0,20);
          for (var c=0; newmail.length < 3; c++) {
            newmail = newmail + c;
          }
          $scope.newuser.name = newmail;
        }

        // Handle general warning
        else if (response.status === 'warning'){
          $scope.message = '<p class="bg-danger">' + response.msg + '</p>';
        }

        // General fallback
        else {
          $scope.message = 'Sorry, something went wrong... ' + JSON.stringify(response.err);
        }
      });
    };
    });
})();
