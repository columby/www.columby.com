'use strict';

angular.module('columbyApp')


.controller('AccountCtrl',
  function($window,$rootScope,$scope, $stateParams,$state,toaster, AccountSrv, AuthSrv, CollectionSrv){
    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $window.document.title = 'columby.com';



    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getCollections(){
    if ($scope.account.collections.length >0){
      console.log('Getting collections.');
      angular.forEach($scope.account.collections, function(value, key) {
        console.log(key + ': ' + value);
        CollectionSrv.get({id:value}, function(result){
          $scope.account.collections[ key] = result;
        });
      });
    } else {
      console.log('no collections');
    }
  }

  function getAccount(){

    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      if (!result._id){
        toaster.pop('warning', null, 'The requested account was not found. ');
        $state.go('home');
      } else {
        $scope.account = result;
        $scope.contentLoading = false;
        $window.document.title = 'columby.com | ' + result.name;

        $scope.account.canEdit = AuthSrv.canEdit({postType: 'account', _id: result._id});

        if ($scope.account.headerImage) {
          updateHeaderBg();
        }

        getCollections();
      }
    });
  }



  function updateHeaderBg(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.account.headerPattern + '), url(' + $scope.account.headerImage + ')',
      'background-blend-mode': 'multiply'
    };
  }


  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */


  /* ---------- INIT ----------------------------------------------------------------------------- */
    if (!$stateParams.slug){
      toaster.pop('warning', null, 'The requested account was not found. ');
      $state.go('home');
    } else {
      getAccount();
    }

})

/***
 * Account View Controller
 *
 ***/
.controller('AccountEditCtrl', function ($window, $scope, $rootScope, $location, $state, $stateParams, $http, AuthSrv, AccountSrv, toaster, $upload) {


  /* ---------- SETUP ----------------------------------------------------------------------------- */
  $scope.contentLoading  = true;
  $window.document.title = 'columby.com';

  /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


  /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
  function getAccount(){
    console.log($stateParams);
    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      console.log(result);
      $scope.account = result;
      $scope.contentLoading = false;
      $window.document.title = 'columby.com | ' + result.name;

      $scope.accountUpdate = {
        name        : $scope.account.name,
        description : $scope.account.description
      };

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

  function updateHeaderImage(){
    $scope.headerStyle={
      'background-image': 'url(' + $scope.account.headerPattern + '), url(' + $scope.account.headerImage + ')',
      'background-blend-mode': 'multiply'
    };
  }



  /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
  $scope.update = function(){
    console.log('updating account.');
    if (!$scope.account._id) {
      console.log('Name changed, but not yet saved');
    } else {
      var changed = false;
      var account = {
        _id: $scope.account._id,
        slug: $scope.account.slug
      };
      if ($scope.accountUpdate.name !== $scope.account.name) {
        changed = true;
        account.name = $scope.accountUpdate.name;
      }
      if ($scope.accountUpdate.description !== $scope.account.description){
        changed = true;
        account.description = $scope.accountUpdate.description;
      }
      console.log('updating account', account);
      AccountSrv.update(account, function(result){
        console.log(result);
        if (result._id){
          $scope.accountUpdate.name = result.name;
          $scope.accountUpdate.description = result.description;
          toaster.pop('success', null, 'Account updated.');
        } else {
          toaster.pop('warning', null, 'There was an error updating the account name.');
        }
      });
    }
  };

  // $scope.createAccount = function(){
  //   console.log('creating account');
  //   AccountSrv.save($scope.account, function(res){
  //     if (res.err){
  //       if (res.code === 11000) {
  //         toaster.pop('danger', 'Sorry, that account name already exists. Please chose a different name. ');
  //       }
  //     }
  //     if (res._id) {
  //       // add to local user
  //       $rootScope.user.accounts.push(res);
  //       toaster.pop('success', 'Created', 'Account created.');
  //       $state.go('account.view', {slug: res.slug});
  //     }
  //   });
  // };


  $scope.onFileSelect = function($files) {
    $scope.upload=[];
    var file = $files[0];
    file.progress = parseInt(0);
    // console.log('file', file);

    // check if the file is an image
    var validTypes = [ 'image/png', 'image/jpg', 'image/jpeg' ];

    if (validTypes.indexOf(file.type) === -1) {
      toaster.pop('alert',null,'File type ' + file.type + ' is not allowed');
      return;
    }

    // First get a signed request from the Columby server
    $http({
      method: 'GET',
      url: 'api/v2/file/sign',
      //skipAuthorization: true,
      params: {
        type: file.type,
        size: file.size,
        name: file.name,
        accountId: $scope.account._id
      }
    })
      .success(function(response) {
        console.log('config', $rootScope.config.aws);

        console.log('policy', response);
        var s3Params = response.credentials;
        var fileResponse = response.file;
        console.log('key', $scope.account._id + '/' + response.file.filename);
        console.log('file', file);

        // Initiate upload
        $scope.upload = $upload.upload({
          url: 'https://' + $rootScope.config.aws.bucket + '.s3.amazonaws.com/',
          method: 'POST',
          // remove Authorization header (angular-jwt)
          skipAuthorization: true,
          data: {
            'key' : 'jan', //file.name,
            'acl' : 'public-read',
            'Content-Type' : file.type,
            'AWSAccessKeyId': s3Params.AWSAccessKeyId,
            'success_action_status' : '201',
            'Policy' : s3Params.s3Policy,
            'Signature' : s3Params.s3Signature
          },
          file: file,
        }).then(function(response) {
          console.log('upload response', response.data);
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
              url: 'api/v2/file/s3success',
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
  }

})
;
