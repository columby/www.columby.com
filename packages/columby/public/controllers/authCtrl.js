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


  .controller('AccountCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    // Get current user
    $scope.user = ColumbyAuthSrv.user();

  }])


  .controller('LogoutCtrl', ['$scope', '$rootScope', '$location', '$state', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', function ($scope, $rootScope, $location, $state, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv) {

    // Logout
    ColumbyAuthSrv.logout().then(function(response){
      console.log(response);
      $scope.status = response;
      if (response.status === 'success') {

        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess, response.user);

        FlashSrv.setMessage({
          value: 'You are now signed out.',
          status: 'info'
        });

        $state.go('home');

      }
    });
  }])

  /***
   * Controller a user's profile page
   *
   ***/
  .controller('ColumbyProfileCtrl', ['$scope', '$rootScope', '$location', '$state', '$stateParams', 'AUTH_EVENTS', 'ColumbyAuthSrv', 'FlashSrv', 'MetabarSrv', function ($scope, $rootScope, $location, $state, $stateParams, AUTH_EVENTS, ColumbyAuthSrv, FlashSrv, MetabarSrv) {

    /***   INITIALISATION   ***/
    var editWatcher;               // Watch for model changes in editmode

    $scope.contentLoading = true;
    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode


    /*** ROOTSCOPE EVENTS ***/
    // Turn on or off editMode for a dataset
    $scope.$on('metabar::editMode', function(evt,mode){
      $scope.editMode = mode;
      if (mode === true){
        // turn edit mode on
        editWatcher = $scope.$watchCollection('profile', function (newval, oldval) {
          if (!angular.equals(oldval, newval)) {
            $scope.contentEdited = true;
          }
        });
      } else {
        // turn watching off.
        editWatcher();
      }
    });


    /***   FUNCTIONS   ***/
    function getProfile(){
      // get profile informatio of user by userSlug
      ColumbyAuthSrv.getProfile($stateParams.userSlug).then(function(result){

        $scope.profile = result.profile;
        $scope.contentLoading = false;

        // send metadata to the metabar
        var item = result.profile;
        item.postType = 'profile';
        var meta = {
          postType: 'profile',
          _id: result.profile._id,
          canEdit: ColumbyAuthSrv.canEdit(item)
        };
        MetabarSrv.setPostMeta(meta);

        // Send a message to the headerController to update the background
        var img = {
          img: result.profile.headerImage,
          pattern: result.profile.headerPattern
        };

        $scope.headerStyle={
          'background-image': 'url(' + result.profile.headerPattern + '), url(' + result.profile.headerImage + ')',
          'background-size': 'auto, 100%',
          
          'background-blend-mode': 'multiply',
        };

      });
    }


    /***   SCOPE FUNCTIONS   ***/
    $scope.toggleEditMode = function(){
      $scope.editMode = !$scope.editMode;
      // send closed message to metabar
      if ($scope.editMode === false) {
        $rootScope.$broadcast('editMode::false');
      }
    };

    $scope.update = function(){

      var updated = {
        _id: $scope.profile._id,
        updated: {
          description: $scope.profile.description
        }
      };

      console.log('Sending update', updated);

      ColumbyAuthSrv.updateProfile(updated).then(function(res){
        console.log(res);
        if (res.status === 'success'){
          $scope.profile = res;
          FlashSrv.setMessage({
            value: 'Profile updated!',
            status: 'info'
          });
          $scope.toggleEditMode();
        }
      });
    };

    /*** INIT ***/
    getProfile();

  }])
;
