'use strict';
angular.module('mean.users')

/***
 * Controller for the Signin page
 *
 ***/
.controller('LoginCtrl', [
  '$scope', '$rootScope', '$location', '$http','$state', 'AUTH_EVENTS', 'AuthSrv', 'toaster',
  function ($scope, $rootScope, $location, $http, $state, AUTH_EVENTS, AuthSrv, toaster) {

  /* ----- SETUP ------------------------------------------------------------ */
  $scope.loginInProgress = false;
  $scope.credentials = {
    name: '',
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
        $rootScope.selectedAccount = $rootScope.user.account.accounts[0];
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);
        console.log('Logged in.');
        toaster.pop('success', 'success', 'You have succesfully signed in.');

        // Redirect back to frontpage
        $state.go('home');
      } else {
        toaster.pop('success', 'error', 'There was an error verifying the login. Please try again.');
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

      if (response.status === 'success') {
        $scope.signinSuccess = true;

      } else if (response.error === 'User not found') {
        toaster.pop('warning', 'Signin error', 'The email address ' + credentials.email + ' does not exist. Would you like to register for a new account?');
        $scope.showRegister = true;
        $scope.newuser={};
        $scope.newuser.email = $scope.credentials.email;

        var newmail = $scope.credentials.email.replace(/@.*$/,'').substring(0,20);
        var c=0;
        while (newmail.length < 3) {
          newmail = newmail + c;
          c++;
        }
        $scope.newuser.name = newmail;

        //$scope.credentials.email = null;
      }
    });
  };

  $scope.register = function(){
    localStorage.removeItem('auth_token');
    $scope.registrationInProgress = true;
    AuthSrv.register($scope.newuser).then(function(response){
      console.log('register response', response);
      $scope.registrationInProgress = false;
      if (response.status === 'error') {
        toaster.pop('warning', 'Registration error', 'There was an error registering: ' + response.error.msg);
      } else {
        $scope.registrationSuccess = true;
      }
    });
  };


  /* ----- INIT ------------------------------------------------------------ */
  var params = $location.search();
  if (params.token) {
    verify(params.token);
  }
}])

.controller('UserCtrl', [
  '$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'AuthSrv', 'AccountSrv', 'toaster',
  function ($scope, $rootScope, $location, $state, AUTH_EVENTS, AuthSrv, AccountSrv, toaster) {

  /* --- FUNCTIONS ------------------------------------------------------------- */
  function getUser(){
    AuthSrv.getUser().then(function(result){
      $scope.user = result;
    });
  }

  $scope.logout = function(){
    AuthSrv.logout().then(function(result){
      localStorage.removeItem('auth_token');
      $rootScope.user = {};
      toaster.pop('success', 'Signed out', 'You are now signed out.');

      $state.go('home');
    });
  };

  // Delete an account
  $scope.deleteAccount = function(index){
    console.log(index);
    console.log($scope.user.accounts[ index].slug);
    // AccountSrv.delete($scope.user.accounts[index ].slug, function(res){
    //   console.log(res);
    // });
  };

  /* --- INIT ------------------------------------------------------------- */
  getUser();

}])

;
