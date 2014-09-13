'use strict';
angular.module('mean.users')

/***
 * Controller a user's profile page
 *
 ***/
.controller('ColumbyProfileCtrl', [
  '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthSrv', 'UserSrv', 'FlashSrv', 'MetabarSrv',
  function ($scope, $rootScope, $location, $state, $stateParams, AUTH_EVENTS, AuthSrv, UserSrv, FlashSrv, MetabarSrv) {

  /* ---------- SETUP ----------------------------------------------------------------------------- */
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
    // get profile information of user by userSlug
    UserSrv.getProfile($stateParams.slug).then(function(result){
      $scope.profile = result.profile;
      $scope.contentLoading = false;

      // send metadata to the metabar
      var item = result.profile;
      item.postType = 'profile';
      var meta = {
        postType: 'profile',
        _id: result.profile._id,
        canEdit: AuthSrv.canEdit(item)
      };
      MetabarSrv.setPostMeta(meta);

      updateHeaderImage();

    });
  }

  function updateHeaderImage(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.profile.headerPattern + '), url(' + $scope.profile.headerImage + ')',
      '-webkit-filter': 'hue-rotate(90deg)',
      'background-blend-mode': 'multiply'
    };
  }

  /***   SCOPE FUNCTIONS   ***/
  $scope.toggleEditMode = function(){
    $scope.editMode = !$scope.editMode;
    // send closed message to metabar
    if ($scope.editMode === false) {
      $rootScope.$broadcast('editMode::false');
    }
  };

  $scope.updateProfile = function(){
    console.log('updating profile');
    var updated = {
      _id: $scope.profile._id,
      updated: {
        description: $scope.profile.description,
        headerImage: $scope.profile.headerImage,
        headerPattern: $scope.profile.headerPattern
      }
    };

    UserSrv.updateProfile(updated).then(function(res){
      if (res.status === 'success'){

        updateHeaderImage();

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
