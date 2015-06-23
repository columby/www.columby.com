'use strict';

angular.module('columbyApp')


/***
 *
 * Signin controller for an existing user.
 *
 ***/
.controller('SigninCtrl', function ($window, $scope, $rootScope, $location, $http, $state, UserSrv, ngNotify) {

  // Check login status
  if (UserSrv.isAuthenticated()) {
    $state.go('settings');
    ngNotify.set('You are already logged in.');
  }

  $rootScope.title = 'Sign in | columby.com';


  // Check if a request is a login token request
  function verify(token) {

    $scope.verificationInProgress = true;

    // Handle Authentication at User Service
    UserSrv.verify(token).then(function(){
      if ($rootScope.user.id) {
        ngNotify.set('You have succesfully signed in.');
        $state.go('home');
      } else {
        ngNotify.set('There was an error verifying the login. Please try again.', 'error');
        delete $scope.verificationInProgress;
      }
    });
  }


  /***
   *
   * Handle passwordless login, results in email to user
   *
   ***/
  $scope.login = function(){
    $scope.loginInProgress = true;

    UserSrv.login({email:$scope.email}).then(function(response){

      delete $scope.loginInProgress;
      if (response.status === 'success') {
        // handle valid response
        $scope.signinSuccess = true;
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


  /***
   *
   * Handle new user account registration
   *
   ***/
  $scope.register = function(){
    $scope.registrationInProgress = true;
    console.log('registering new user', $scope.newuser);
    UserSrv.register($scope.newuser).then(function(response){
      console.log('register response', response);
      delete $scope.registrationInProgress;
      if (response.errors && response.errors.email && (response.errors.email.message==='E-mail address is already in-use') ) {
        ngNotify.sset('This email address is already registered, please sign in!','error');
      } else {
        $scope.registrationSuccess = true;
      }
    });
  };


  /***
   *
   * Check if user sent a verification token with page request.
   *
   ***/
  var params = $location.search();
  if (params.token) {
    verify(params.token);
  }
})



/***
 *
 * Register controller for a new user.
 *
 ***/
.controller('RegisterCtrl', function ($window, $scope, $rootScope, $location, $http, $state, UserSrv, ngNotify, Slug) {

  // if user is already logged in
  if($rootScope.user.id){
    ngNotify.set('You are already logged in.', 'error');
    $state.go('settings');
  }

  $window.document.title = 'Register | columby.com';

  $scope.register = function(){

    $scope.registrationInProgress = true;

    UserSrv.register($scope.newuser).then(function(response){
      delete $scope.registrationInProgress;

      if (response.errors && response.errors.email && (response.errors.email.message==='E-mail address is already in-use') ) {
        ngNotify.set('This email address is already registered, please sign in!', 'error');
      } else {
        $scope.registrationSuccess = true;
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
})



/***
 *
 * .Controller for currently logged in user.
 *
 ***/
.controller('UserCtrl', function ($scope, $rootScope, $location, $state, UserSrv, ngNotify) {

  $scope.logout = function(){
    UserSrv.logout();
    ngNotify.set('You are now signed out.');
    $state.go('home');
  };

  // Delete an account
  $scope.deleteAccount = function(index){
    console.log(index);
    console.log($scope.user.accounts[ index].slug);
    // AccountSrv.delete($scope.user.accounts[index ].slug, function(res){
    //   console.log(res);
    // });
  };


  UserSrv.me().then(function(result){
    $scope.user = result;
  });
});
