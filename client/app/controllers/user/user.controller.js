'use strict';

angular.module('columbyApp')


/***
 *
 * Signin controller for an existing user.
 *
 ***/
.controller('SigninCtrl', function ($rootScope, $scope, $state, UserSrv, AuthSrv, ngNotify) {

  $rootScope.title = 'Sign in | columby.com';

  // Check login status
  console.log(AuthSrv.isAuthenticated());
  if (AuthSrv.isAuthenticated()) {
    console.log('already authenticated');
    $state.go('settings');
    ngNotify.set('You are already logged in.');
  } else {
    console.log('Not logged in');
  }


  /***
   *
   * Handle passwordless login, results in email to user
   *
   ***/
  $scope.authenticate = function(provider){

    $scope.loginInProgress = true;
    var email = $scope.email;

    AuthSrv.authenticate(provider, email).then(function(response){
      delete $scope.loginInProgress;

      // handle email login
      if (provider==='email'){
        if (response.status === 'success') {
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
      } else {
        // handle oauth login

      }
    })
  };

})

/***
 *
 * Check if user sent a verification token with page request.
 *
 ***/
.controller('UserVerifyCtrl', function($location){

  var token = $location.search().token;

  AuthSrv.verify(token).then(function(){
    if ($rootScope.user.id) {
      ngNotify.set('You have succesfully signed in.');
      $state.go('home');
    } else {
      ngNotify.set('There was an error verifying the login. Please try again.', 'error');
      delete $scope.verificationInProgress;
    }
  });
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
 * Controller for currently logged in user.
 *
 ***/
.controller('UserCtrl', function ($scope, $rootScope, $location, $state, UserSrv, ngNotify) {

  // Set the default active panel
  $scope.activePanel = 'profile';

  // Get the currently loggedin user from the server.
  function fetchAccount(){
    UserSrv.me().then(function(result){
      console.log(result);
      result.organisations = [];
      for (var i=0; i<result.accounts.length; i++) {
        console.log(result.accounts[ i]);
        if (result.accounts[ i].primary === true) {
          //result.account = result.accounts[ i];
        } else {
          result.organisations.push(result.accounts[ i]);
        }
      }
      delete result.accounts;
      $scope.user = result;
      console.log($scope.user);
    });
  }

  function saveAccount(){

  }

  // Change the active panel when a user clicks on a menu-link
  $scope.changePanel = function(panel) {
    // Check for model change and alert to save changes

    // Change the active panel
    $scope.activePanel = panel;
  }

  // Logout the current user
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


  // Initialize
  fetchAccount();
});
