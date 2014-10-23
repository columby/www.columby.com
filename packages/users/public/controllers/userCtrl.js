'use strict';
angular.module('mean.users')

/***
 * Controller for the Signin page
 *
 ***/
.controller('LoginCtrl', [
  '$scope', '$rootScope', '$location', '$http','$state', 'AUTH_EVENTS', 'AuthSrv', 'toaster', 'Slug',
  function ($scope, $rootScope, $location, $http, $state, AUTH_EVENTS, AuthSrv, toaster, Slug) {

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
      if (response.status === 'success'){
        // save JWT token in local storage (browser)
        localStorage.setItem('auth_token', JSON.stringify(response.token));
        // save JWT token in auth Service so we can use it with each request to the Columby API
        AuthSrv.setColumbyToken = 'Bearer ' + response.token;

        // Let the app know
        $rootScope.user = {
          account: AuthSrv.user(),
          isAuthenticated: AuthSrv.isAuthenticated(),
          selectedAccount: 0
        };

        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response.user);

        toaster.pop('success', null, 'You have succesfully signed in.');
        toaster.pop('success', null, 'Activated publication account: ' + $rootScope.user.accounts[0].username);


        // Redirect back to frontpage
        $state.go('home');
      } else {
        toaster.pop('warning', 'error', 'There was an error verifying the login. Please try again.');
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

  $scope.slugifyName = function(){
    console.log('sl', $scope.newuser.name);
    if ($scope.newuser.name){
      var n = Slug.slugify($scope.newuser.name);
      console.log(n.length);
      while(n.length<3){
        n = n+'-';
      }
      $scope.newuser.name = n;
    }
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
