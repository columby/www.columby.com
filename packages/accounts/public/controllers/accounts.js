'use strict';

angular.module('mean.accounts')


/***
 * Controller a user's account page
 *
 ***/
.controller('AccountCtrl', [
  '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthSrv', 'AccountSrv', 'MetabarSrv',
  function ($scope, $rootScope, $location, $state, $stateParams, AUTH_EVENTS, AuthSrv, AccountSrv, MetabarSrv) {

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
      editWatcher = $scope.$watchCollection('account', function (newval, oldval) {
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
  function getAccount(){
    // get account information of user by userSlug
    AccountSrv.getAccount($stateParams.slug).then(function(result){
      $scope.account = result;
      $scope.contentLoading = false;

      // send metadata to the metabar
      var item = result;
      item.postType = 'account';
      var meta = {
        postType: 'account',
        _id: result._id,
        canEdit: AuthSrv.canEdit(item)
      };
      MetabarSrv.setPostMeta(meta);

      updateHeaderImage();

    });
  }

  function updateHeaderImage(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.account.headerPattern + '), url(' + $scope.account.headerImage + ')',
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

  /*** INIT ***/
  getAccount();

}])
;
