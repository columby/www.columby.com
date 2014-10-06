'use strict';

angular.module('mean.accounts')


/***
 * Controller a user's account page
 *
 ***/
.controller('AccountCtrl', [
  '$scope', '$rootScope', '$location', '$state', '$stateParams', 'AUTH_EVENTS', 'AuthSrv', 'AccountSrv', 'MetabarSrv', 'toaster',
  function ($scope, $rootScope, $location, $state, $stateParams, AUTH_EVENTS, AuthSrv, AccountSrv, MetabarSrv, toaster) {

  /* ---------- SETUP ----------------------------------------------------------------------------- */
  var editWatcher;               // Watch for model changes in editmode

  $scope.editMode        = false;       // edit mode is on or off
  $scope.contentLoading  = true;
  $scope.contentEdited   = false;  // models is changed or not during editmode
  $scope.userId          = $stateParams.userId;
  $scope.accountSlug     = $stateParams.slug;

  if ($state.current.data && $state.current.data.editMode) {
    $scope.editMode = true;
  }

  /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */
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


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getAccount(){
    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){

      $scope.account = result.account;
      $scope.contentLoading = false;

      // send metadata to the metabar
      var item = $scope.account;
      item.postType = 'account';
      var meta = {
        postType: 'account',
        _id: $scope.account._id,
        canEdit: AuthSrv.canEdit(item)
      };
      MetabarSrv.setPostMeta(meta);

      updateHeaderImage();

    });
  }

  function initiateNewAccount(){
    $scope.account = {
      name        : 'New account',
      description : 'Description of the account',
      owner       : $scope.userId
    };
    $scope.contentLoading = false;
    console.log('account initiated', $scope.account);
  }

  function updateHeaderImage(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.account.headerPattern + '), url(' + $scope.account.headerImage + ')',
      '-webkit-filter': 'hue-rotate(90deg)',
      'background-blend-mode': 'multiply'
    };
  }


  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  $scope.toggleEditMode = function(){
    $scope.editMode = !$scope.editMode;
    // send closed message to metabar
    if ($scope.editMode === false) {
      $rootScope.$broadcast('editMode::false');
    }
  };

  $scope.create = function(){
    AccountSrv.save($scope.account, function(res){
      if (res.err){
        if (res.code === 11000) {
          toaster.pop('danger', 'Sorry, that account name already exists. Please chose a different name. ');
        }
      }
      if (res._id) {
        // add to local user
        $rootScope.user.accounts.push(res);
        toaster.pop('success', 'Created', 'Account created.');
        $state.go('account.view', {slug: res.slug});
      }
    });
  };

  $scope.update = function(){
    console.log('updating', $scope.account);
    AccountSrv.update($scope.account, function(result){
      console.log('result', result);
      if (result.status === 'success') {
        toaster.pop('success', 'Updated', 'Account updated.');
        $scope.toggleEditMode();
      } else {
        toaster.pop('warning', 'Updated', 'Account There was an error updating.');
      }
    });
  };

  
  /* ---------- INIT ----------------------------------------------------------------------------- */
  // View existing account
  if ($scope.accountSlug && !$scope.editMode) {
    // Get account for the provided slug
    getAccount();
  } else if($scope.slug && $scope.editMode) {
    getAccount();
    // make sure edit mode is turned on
    $rootScope.$broadcast('metabar::editMode', true);
  } else if ($scope.editMode){
    // Create a new base collection
    initiateNewAccount();
    // make sure edit mode is turned on
    $rootScope.$broadcast('metabar::editMode', true);
  }

}])
;
