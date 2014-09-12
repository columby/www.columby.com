'use strict';

angular.module('mean.account')

  /***
   * Controller for the Signin page
   *
   ***/
  .controller('LoginCtrl', [
    '$scope', '$rootScope', '$location', '$http','$state', 'AUTH_EVENTS', 'AuthSrv', 'FlashSrv',
    function ($scope, $rootScope, $location, $http, $state, AUTH_EVENTS, AuthSrv, FlashSrv) {

    /* ----- SETUP ------------------------------------------------------------ */
    $scope.loginInProgress = false;
    $scope.credentials = {
      username: '',
      email: ''
    };


    /* ----- FUNCTIONS -------------------------------------------------------- */
    // Check if a request is a login token request
    function verify(token) {
      $scope.verificationInProgress = true;
      AuthSrv.verify(params.token).then(function(response){
        console.log(response);
        if (response.status === 'success'){
          // save JWT token
          console.log('Save JWT to local storage:',response.token );
          localStorage.setItem('auth_token', JSON.stringify(response.token));
          // set header with the received token
          console.log('Set Authorization header with received JWT');
          $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
          // Let the app know
          $rootScope.user = {
            account: AuthSrv.user(),
            isAuthenticated: AuthSrv.isAuthenticated()
          };
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


    /* ----- ROOTSCOPE EVENTS -------------------------------------------------------- */

    /* ----- SCOPE FUNCTIONS -------------------------------------------------------- */
    // Handle passwordless login
    $scope.login = function(){
      $scope.loginInProgress = true;
      var credentials = $scope.credentials;

      AuthSrv.login(credentials).then(function(response){
        $scope.loginInProgress = false;
        console.log(response);
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

    $scope.register = function(){
      localStorage.removeItem('auth_token');
      $scope.registrationInProgress = true;
      $scope.loginError = null;
      AuthSrv.register($scope.newuser).then(function(response){
        if (response.error === 'Error registering user.') {
          $scope.registrationError = response.error;
        }
        $scope.registrationSuccess = true;
        $scope.registrationInProgress = false;
      });
    };


    /* ----- INIT ------------------------------------------------------------ */
    var params = $location.search();
    if (params.token) {
      verify(params.token);
    }
  }])

  .controller('AccountCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'AuthSrv', '$notification', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, AuthSrv, $notification) {

    /*** FUNCTIONS ***/
    function getAccount(){
      AuthSrv.getAccount().then(function(result){
        $scope.account = result.account;
      });
    }

    $scope.logout = function(){
      console.log('logging out');
      AuthSrv.logout().then(function(result){
        localStorage.removeItem('auth_token');
        $rootScope.user = {};
        $notification.info('You are now signed out.');

        $state.go('home');
      });
    };

    $scope.updateAccount = function(){
      console.log('updating account.');
      var update = {
        username: $scope.account.username,
      };
      var id = $scope.account._id;
      delete update._id;

      AuthSrv.updateAccount(id, update).then(function(res){
        console.log('auth response', res);
        $rootScope.$broadcast('account::updated');
        $notification.info('Account updated');
      });
    };

    /*** INIT ***/
    getAccount();

  }])

;
