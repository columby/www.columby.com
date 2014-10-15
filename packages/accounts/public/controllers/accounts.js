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

  // check edit mode
  if ($location.path().split('/')[3] === 'edit') {
    $scope.editMode = true;
  }

  /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getAccount(){

    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      console.log(result);
      $scope.account = result.account;
      $scope.contentLoading = false;

      // set draft title and description
      if ($scope.editMode){
        $scope.account.nameUpdate = $scope.account.name;
        $scope.account.descriptionUpdate = $scope.account.description;
      }

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

  function toggleEditMode(mode){
    $scope.editMode = mode || !$scope.editMode;
    if ($scope.editMode) {
      $scope.account.nameUpdate = $scope.account.name;
      $scope.account.descriptionUpdate = $scope.account.description;
    }
  }

  function updateHeaderImage(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.account.headerPattern + '), url(' + $scope.account.headerImage + ')',
      '-webkit-filter': 'hue-rotate(90deg)',
      'background-blend-mode': 'multiply'
    };
  }



  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  /*** Editmode functions */
  $scope.toggleEditmode = function(){
    if ($scope.editMode) {
      $state.go('account.view', {slug: $stateParams.slug});
    } else {
      $state.go('account.edit', {slug: $stateParams.slug});
    }
  };


  $scope.updateName = function() {
    console.log('updating account name');
    if (!$scope.account._id) {
      console.log('Name changed, but not yet saved');
    } else {
      if ($scope.account.nameUpdate === $scope.account.title) {
        console.log('Account saved, but no name change');
      } else {
        var account = {
          slug: $scope.account.slug,
          name: $scope.account.nameUpdate,
        };
        console.log('updating account name', account);

        AccountSrv.update(account, function(result){
          console.log(result);
          if (result._id){
            $scope.account.nameUpdate = result.name;
            toaster.pop('success', null, 'Account name updated.');
          } else {
            toaster.pop('warning', null, 'There was an error updating the account name.');
          }
        });
      }
    }
  };

  $scope.updateDescription = function() {
    console.log('updating description');
    if (!$scope.account._id) {
      console.log('Not yet saved');
    } else {
      console.log($scope.account.descriptionUpdate);
      console.log($scope.account.description);
      if ($scope.account.descriptionUpdate === $scope.account.description) {
        console.log('No description change');
      } else {
        var account = {
          slug        : $scope.account.slug,
          _id         : $scope.account._id,
          description : $scope.account.descriptionUpdate
        };
        AccountSrv.update(account, function(res){
          if (res._id){
            $scope.account.descriptionUpdate = res.description;
            toaster.pop('success', null, 'Description updated.');
          } else {
            toaster.pop('warning', null, 'Error updating description.');
          }
        });
      }
    }
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
  if ($stateParams.slug) {
    getAccount();
  } else {
    initiateNewAccount();
    toggleEditMode(true);
  }

}])
;
