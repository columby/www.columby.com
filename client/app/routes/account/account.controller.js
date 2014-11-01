'use strict';

angular.module('columbyApp')


/***
 * Controller a user's account page
 *
 ***/
.controller('AccountCtrl', function ($window, configuration, $scope, $rootScope, $location, $state, $stateParams, $http, AuthSrv, AccountSrv, toaster, $upload) {


  /* ---------- SETUP ----------------------------------------------------------------------------- */
  $scope.editMode        = false;       // edit mode is on or off
  $scope.contentLoading  = true;
  $scope.contentEdited   = false;  // models is changed or not during editmode
  $window.document.title = 'columby.com';

  // check edit mode
  if ($location.path().split('/')[3] === 'edit') {
    $scope.editMode = true;
  }

  /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getAccount(){

    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      $scope.account = result;
      $scope.contentLoading = false;
      $window.document.title = 'columby.com | ' + result.name;

      // set draft title and description
      if ($scope.editMode){
        $scope.accountUpdate.name        = $scope.account.name;
        $scope.accountUpdate.description = $scope.account.description;
      }

      $scope.account.canEdit= AuthSrv.canEdit({postType:'account', _id:result._id});

      updateHeaderImage();

    });
  }

  function initiateNewAccount(){
    $scope.account = {
      name        : 'New account',
      description : '<p>Account description</p>',
      owner       : $rootScope.user._id,
      canEdit     : true
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
      if ($scope.account.nameUpdate === $scope.account.name) {
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
    console.log('creating account');
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

  $scope.onFileSelect = function($files) {
    $scope.upload=[];
    var file = $files[0];
    file.progress = parseInt(0);
    console.log('file', file);

    // check if the file is an image
    var validTypes = [ 'image/png' ];

    if (validTypes.indexOf(file.type) === -1) {
      toaster.pop('alert',null,'File type ' + file.type + ' is not allowed');
      return;
    }

    // First get a signed request from the Columby server
    $http({
      method: 'GET',
      url: 'api/v2/files/sign',
      params: {
        type: file.type,
        size: file.size,
        name: file.name,
        accountId: $scope.account._id
      },
      headers: {
        Authorization: AuthSrv.columbyToken()
      }
    })
      .success(function(response){
        var s3Params = response.credentials;
        var fileResponse = response.file;
        // Initiate upload
        $scope.upload = $upload.upload({
          url: 'https://s3.amazonaws.com/' + configuration.aws.bucket,
          method: 'POST',
          data: {
            'key' : $scope.account._id + '/' + response.file.filename,
            'acl' : 'public-read',
            'Content-Type' : file.type,
            'AWSAccessKeyId': s3Params.AWSAccessKeyId,
            'success_action_status' : '201',
            'Policy' : s3Params.s3Policy,
            'Signature' : s3Params.s3Signature
          },
          file: file,
        }).then(function(response) {
          console.log(response.data);
          file.progress = parseInt(100);
          if (response.status === 201) {
            // convert xml response to json
            var data = window.xml2json.parser(response.data),
            parsedData;
            parsedData = {
                location: data.postresponse.location,
                bucket: data.postresponse.bucket,
                key: data.postresponse.key,
                etag: data.postresponse.etag
            };

            // upload finished, update the file reference
            $http({
              method: 'POST',
              url: 'api/v2/files/s3success',
              data: {
                fileId: fileResponse._id,
                url: parsedData.location
              },
              headers: {
                Authorization: AuthSrv.columbyToken()
              }
            })
            .success(function(response){
              console.log('res', response);
              $scope.account.avatar.url = response.url;
              var a = {
                slug: $scope.account.slug,
                avatar: {
                  url: response.url
                }
              };
              console.log('a', a);
              AccountSrv.update(a, function(result){
                console.log('r',result);
                if (result.status === 'success') {
                  toaster.pop('success', 'Updated', 'Account updated.');
                } else {
                  toaster.pop('warning', 'Updated', 'Account There was an error updating.');
                }
              });
            })
            .error(function(data, status, headers, config){
              console.log('res', data);
              console.log(status);
              console.log(headers);
              console.log(config);
            });
            // $scope.imageUploads.push(parsedData);

          } else {
            console.log('Upload Failed');
          }
        }, function(e){
          console.log(e);
        }, function(evt) {
          console.log(evt);
          file.progress =  parseInt(100.0 * evt.loaded / evt.total);
        });
      })
      .error(function(data, status){
        console.log('Error message', data.err);
        console.log(status);
      });
  };


  /* ---------- INIT ----------------------------------------------------------------------------- */
  if ($stateParams.slug) {
    getAccount();
  } else {
    initiateNewAccount();
    toggleEditMode(true);
  }

})
;
