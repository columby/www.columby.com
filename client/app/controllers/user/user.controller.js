'use strict';

angular.module('columbyApp')

  .controller('SigninCtrl', function ($window, $scope, $rootScope, $location, $http, $state, AuthSrv, toaster, Slug) {

  /* ----- SETUP ------------------------------------------------------------ */
  // if user is already logged in
  if($rootScope.user.id){
    toaster.pop('danger', null, 'You are already logged in. ');
    $state.go('settings');
  }
  // Check
    $scope.loginInProgress = false;
  $window.document.title = 'columby.com | signin';


  /* ----- FUNCTIONS -------------------------------------------------------- */
  // Check if a request is a login token request
  function verify(token) {

    $scope.verificationInProgress = true;

    // Handle Authentication at Authentication service
    AuthSrv.verify(token).then(function(){
      console.log($rootScope.user);
      if ($rootScope.user.id) {
        toaster.pop('success', null, 'You have succesfully signed in.');
        // Redirect back to frontpage
        $state.go('home');
      } else {
        toaster.pop('warning', null, 'There was an error verifying the login. Please try again.');
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

      $scope.loginInProgress = false;
      if (response.status === 'success') {
        // handle valid response
        $scope.signinSuccess = true;
      } else if (response.status === 'not_found') {
        toaster.pop('warning', 'Signin error', 'The email address ' + $scope.email + ' does not exist. Would you like to register for a new account?');
        $scope.newuser={};
        $scope.newuser.email = $scope.email;

        var newmail = $scope.email.replace(/@.*$/,'').substring(0,20);
        for (var c=0; newmail.length < 3; c++) {
          newmail = newmail + c;
        }
        $scope.newuser.name = newmail;
      } else {
        toaster.pop('warning', null, 'Sorry, something went wrong... ' + JSON.stringify(response.err));
      }

    });
  };

  $scope.register = function(){
    localStorage.removeItem('columby_token');
    $scope.registrationInProgress = true;
    console.log('registering new user', $scope.newuser);
    AuthSrv.register($scope.newuser).then(function(response){
      console.log('register response', response);
      $scope.registrationInProgress = false;
      if (response.errors && response.errors.email) {
        if (response.errors.email.message==='E-mail address is already in-use'){
          toaster.pop('danger', 'This email address is already registered, please sign in!');
        }
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


  /* ----- INIT ------------------------------------------------------------ */
  var params = $location.search();
  if (params.token) {
    verify(params.token);
  }
})

  .controller('RegisterCtrl', function ($window, $scope, $rootScope, $location, $http, $state, AuthSrv, toaster, Slug) {

    /* ----- SETUP ------------------------------------------------------------ */
    // if user is already logged in
    if($rootScope.user.id){
      toaster.pop('danger', null, 'You are already logged in. ');
      $state.go('settings');
    }
    // Check
    $scope.loginInProgress = false;
    $window.document.title = 'columby.com | register';


    /* ----- FUNCTIONS -------------------------------------------------------- */

    /* ----- ROOTSCOPE EVENTS -------------------------------------------------------- */

    /* ----- SCOPE FUNCTIONS -------------------------------------------------------- */
    $scope.register = function(){
      localStorage.removeItem('columby_token');
      $scope.registrationInProgress = true;
      console.log('registering new user', $scope.newuser);
      AuthSrv.register($scope.newuser).then(function(response){
        console.log('register response', response);
        $scope.registrationInProgress = false;
        if (response.errors && response.errors.email) {
          if (response.errors.email.message==='E-mail address is already in-use'){
            toaster.pop('danger', 'This email address is already registered, please sign in!');
          }
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


    /* ----- INIT ------------------------------------------------------------ */

  })

  .controller('UserCtrl', function ($scope, $rootScope, $location, $state, AuthSrv, AccountSrv, toaster) {

  /* --- FUNCTIONS ------------------------------------------------------------- */
  function getUser(){
    console.log('getting the user');
    AuthSrv.me().then(function(result){
      console.log('user', result);
      $scope.user = result;
    });
  }

  $scope.logout = function(){
    AuthSrv.logout();
    $rootScope.user = {};
    toaster.pop('success', null, 'You are now signed out.');
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

  /* --- INIT ------------------------------------------------------------- */
  getUser();

})
;
