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
  $scope.editMode        = false;       // edit mode is on or off
  $scope.contentLoading  = true;
  $scope.contentEdited   = false;  // models is changed or not during editmode
  $scope.userId          = $stateParams.userId;
  $scope.accountSlug     = $stateParams.slug;

  if ($state.current.data && $state.current.data.editMode) {
    $scope.editMode = true;
  }

  /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getAccount(){
    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){

      $scope.account = result.account;
      $scope.contentLoading = false;

      $scope.account.canEdit= AuthSrv.canEdit({postType:'account', _id:result.account._id});

      updateHeaderImage();

    });
  }

  function initiateNewAccount(){
    $scope.account = {
      name        : 'New account',
      description : '<p>Account description</p>',
      owner       : $rootScope.user._id
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

  function toggleEditmode(mode) {
    if (!mode){
      $scope.editMode = !$scope.editMode;
    } else if (mode===true) {
      $scope.editMode = mode;
      // watch title change
      if ($scope.account._id){
        $scope.$watch('account.name', function(newVal, oldVal) {
          if (newVal !== oldVal){
            AccountSrv.update($scope.account, function(res){
              if (res.status==='success'){
                toaster.pop('success', 'Updated', 'Account name updated.');
              } else {
                toaster.pop('warning', 'Update error', 'Error updating account name.');
              }
            });
          }
        });
      }
    } else if (mode===false) {
      $scope.editMode = mode;
    }
  }


  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  $scope.enterEditmode = function(){
    toggleEditmode(true);
  };
  $scope.exitEditmode = function(){
    toggleEditmode(false);
  };


  $scope.createAccount = function(){
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

  $scope.updateAccount = function(){
    if ($scope.account._id){
      console.log('updating account');
      AccountSrv.update($scope.account, function(result){
        if (result.status === 'success') {
          toaster.pop('success', 'Updated', 'Account updated.');
        } else {
          toaster.pop('warning', 'Updated', 'Account There was an error updating.');
        }
      });
    }
  };


  /* ---------- INIT ----------------------------------------------------------------------------- */
  // View existing account
  if ($scope.accountSlug && !$scope.editMode) {
    // Get account for the provided slug
    getAccount();
  } else if($scope.slug && $scope.editMode) {
    getAccount();
  } else if ($scope.editMode){
    // Create a new account
    initiateNewAccount();
  }

}])
;
