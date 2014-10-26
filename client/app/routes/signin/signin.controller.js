'use strict';

angular.module('columbyApp')
  .controller('SigninCtrl', function ($scope, $rootScope, $location, $http, $state, AuthSrv, toaster, Slug) {

  /* ----- SETUP ------------------------------------------------------------ */
  $scope.loginInProgress = false;


  /* ----- FUNCTIONS -------------------------------------------------------- */
  // Check if a request is a login token request
  function verify(token) {
    $scope.verificationInProgress = true;
    AuthSrv.verify(token).then(function(response){
      if (response.status === 'success'){
        console.log('token received', response.token);
        // save JWT token in local storage (browser)
        localStorage.setItem('columby_token', JSON.stringify(response.token));
        // save JWT token in auth Service so we can use it with each request to the Columby API
        AuthSrv.setColumbyToken = 'Bearer ' + response.token;
        
        // Let the app know
        $rootScope.user = {
          account: AuthSrv.user(),
          isAuthenticated: AuthSrv.isAuthenticated(),
          selectedAccount: 0
        };

        toaster.pop('success', null, 'You have succesfully signed in.');

        // Redirect back to frontpage
        $state.go('home');
      } else {
        toaster.pop('warning', 'error', 'There was an error verifying the login. Please try again.');
        $state.go('signin');
      }
    });
  }


  /* ----- ROOTSCOPE EVENTS -------------------------------------------------------- */

  /* ----- SCOPE FUNCTIONS -------------------------------------------------------- */
  // Handle passwordless login
  $scope.login = function(){
    $scope.loginInProgress = true;

    AuthSrv.login({email:$scope.email}).then(function(response){

      if (response) {
        // handle valid response
        $scope.signinSuccess = true;
      } else {
        toaster.pop('warning', 'Signin error', 'The email address ' + $scope.email + ' does not exist. Would you like to register for a new account?');
        $scope.newuser={};
        $scope.newuser.email = $scope.email;

        var newmail = $scope.email.replace(/@.*$/,'').substring(0,20);
        for (var c=0; newmail.length < 3; c++) {
          newmail = newmail + c;
        }
        $scope.newuser.name = newmail;
      }
      $scope.loginInProgress = false;
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
});
