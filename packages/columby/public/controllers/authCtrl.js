'use strict';

angular.module('mean.columby')

  /***
   * Controller for the Signin page
   *
   ***/
  .controller('ColumbyLoginCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    // Initialization
    $scope.loginInProgress = false;
    $scope.credentials = {
      username: '',
      email: ''
    };

    // Check if a request is a login token request
    var params = $location.search();
    if (params.token) {
      $scope.verificationInProgress = true;
      ColumbyAuthSrv.passwordlessVerify(params.token).then(function(response){
        if (response.status === 'success'){
          // Let the app know
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
          console.log('Logged in.');
          FlashSrv.setMessage({
            value: 'You have succesfully signed in.',
            status: 'info'
          });
          // Redirect back to frontpage
          $state.go('home');
        } else {
          FlashSrv.setMessage({
            value: 'There was an error verifying the login. Please try again.',
            status: 'danger'
          });
        }
        $scope.verificationInProgress = true;
      });
    }

    // Handle passwordless login
    $scope.passwordlessLogin = function(){
      $scope.loginInProgress = true;
      var credentials = $scope.credentials;

      ColumbyAuthSrv.passwordlessLogin(credentials).then(function(response){
        $scope.loginInProgress = false;

        if (response.status === 'success') {
          $scope.signinSuccess = true;

        } else if (response.error === 'User not found') {
          $scope.loginError = 'The email address ' + credentials.email + ' does not exist. Would you like to register for a new account?';
          $scope.showRegister = true;
          $scope.newuser={};
          $scope.newuser.email = $scope.credentials.email;

          var newmail = $scope.credentials.email.replace(/@.*$/,'').substring(0,20);
          var c=0;
          while (newmail.length < 3) {
            newmail = newmail + c;
            c++;
          }
          $scope.newuser.username = newmail;

          //$scope.credentials.email = null;
        }
      });
    };

    $scope.passwordlessRegister = function(){
      $scope.registrationInProgress = true;
      $scope.loginError = null;
      ColumbyAuthSrv.passwordlessRegister($scope.newuser).then(function(response){
        if (response.error === 'Error registering user.') {
          $scope.registrationError = response.error;
        }
        $scope.registrationSuccess = true;
        $scope.registrationInProgress = false;
      });
    };
  }])


  .controller('ColumbyAccountCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {
    // Get current user
    $scope.user = ColumbyAuthSrv.user();
    // Get email requires server check
    //$scope.user.email = ColumbyAuthSrv.getEmail();
    console.log($scope.user);
  }])

  /***
   * Controller a user's profile page
   *
   ***/
  .controller('ColumbyProfileCtrl', ['$scope', '$rootScope', '$location', '$state', '$stateParams', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', 'MetabarSrv', function ($scope, $rootScope, $location, $state, $stateParams, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv, MetabarSrv) {

    $scope.contentLoading = true;

    // get profile informatio of user by userSlug
    ColumbyAuthSrv.getProfile($stateParams.userSlug).then(function(result){
      $scope.profile = result.profile;
      $scope.contentLoading = false;
      var item = result.profile;
      item.postType = 'profile';
      // send metadata to the metabar
      var meta = {
        postType: 'profile',
        _id: result.profile._id,
        canEdit: ColumbyAuthSrv.canEdit(item)
      };
      MetabarSrv.setPostMeta(meta);

    });

    // Send info to metabar

  }])
;
