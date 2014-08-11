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
      email: '',
      password: ''
    };

    // Check if a request is a login token request
    var params = $location.search();
    if (params.token) {
      $scope.verificationInProgress = true;
      ColumbyAuthSrv.passwordlessVerify(params.token).then(function(response){
        if (response.status === 'success'){
          // Let the app know
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
          FlashSrv.setMessage({
            value: 'You have succesfully signed in.',
            status: 'info'
          });
          // Redirect back to frontpage
          $state.go('home');
        } else {
          $scope.verificationError = response.statusMessage;
        }
        $scope.verificationInProgress = true;
      });
    }

    // Handle passwordless login
    $scope.passwordlessLogin = function(){
      $scope.loginInProgress = true;
      var credentials = $scope.credentials;
      console.log('passwordlesslogin');
      console.log(credentials);

      ColumbyAuthSrv.passwordlessLogin(credentials).then(function(response){
        $scope.loginInProgress = false;
        console.log(response);
        if (response.status === 'success') {
          $scope.signinSuccess = true;
          console.log('user', ColumbyAuthSrv.user());
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

  .controller('ColumbyProfileCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {
    // Get current user
    $scope.user = ColumbyAuthSrv.user();
    $scope.profile = ColumbyAuthSrv.user();
  }])
;
