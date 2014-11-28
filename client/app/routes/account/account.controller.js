'use strict';

angular.module('columbyApp').controller('AccountCtrl',
  function($window,$rootScope,$scope, $stateParams,$state,toaster, AccountSrv, AuthSrv, CollectionSrv, DatasetSrv){

    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $window.document.title = 'columby.com';



    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getCollections(){
      if ($scope.account.collections && $scope.account.collections.length >0){
        angular.forEach($scope.account.collections, function(value, key) {
          CollectionSrv.get({id:value}, function(result){
            $scope.account.collections[ key] = result;
          });
        });
      } else {
        console.log('no collections');
      }
    }

    function getDatasets(){

      DatasetSrv.index({accountId: $scope.account.id}, function(d){
        $scope.datasets = d.rows;
      });

    }

  function getAccount(){

    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      if (!result.id){
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
        getDatasets();
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
 *
 * Account View Controller
 *
 ***/
.controller('AccountEditCtrl',
  function ($window, $scope, $rootScope, $location, $state, $stateParams, $http, AuthSrv, AccountSrv, toaster, $upload, FileSrv, ngProgress) {


    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $window.document.title = 'columby.com';

    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getAccount(){
      console.log($stateParams);
      // get account information of user by userSlug
      AccountSrv.get({slug: $stateParams.slug}, function(result){
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

    /**
     *
     * Upload a file with a valid signed request
     *
     * @param params
     * @param file
     */
    function uploadFile(params, file) {

      file.filename = params.file.filename;

      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      // Populate the Post paramters.
      fd.append('key', params.file.account_id + '/' +file.filename);
      fd.append('AWSAccessKeyId', params.credentials.key);
      fd.append('acl', 'public-read');
      //fd.append('success_action_redirect', "https://attachments.me/upload_callback")
      fd.append('policy', params.credentials.policy);
      fd.append('signature', params.credentials.signature);
      fd.append('Content-Type', params.file.filetype);
      fd.append('success_action_status', '201');
      // This file object is retrieved from a file input.
      fd.append('file', file);

      xhr.upload.addEventListener('progress', function (evt) {
        ngProgress.set(parseInt(100.0 * evt.loaded / evt.total));
      }, false);

      xhr.addEventListener('load', function(evt){
        ngProgress.complete();
        var parsedData = FileSrv.handleS3Response(evt.target.response);
        var p = {
          fid: params.file.id,
          url: parsedData.location
        };
        finishUpload(p);
      });
      xhr.addEventListener('error', function(evt){
        ngProgress.complete();
        toaster.pop('warning',null,'There was an error attempting to upload the file.' + evt);
      }, false);
      xhr.addEventListener("abort", function(){
        ngProgress.complete();
        toaster.pop('warning',null,'The upload has been canceled by the user or the browser dropped the connection.');
      }, false);

      xhr.open('POST', 'https://' + params.credentials.bucket + '.s3.amazonaws.com/', true);
      xhr.send(fd);
    }
    function finishUpload(params){
      FileSrv.finishS3(params).then(function(res){
        console.log('res', res);
        if (res.url){
          $scope.account.avatar = res.url;
          $scope.account.$update(function(result){
            console.log('update', result);
          });
        }
      });
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

    /**
     *
     * Handle file select
     *
     * @param $files
     */
    $scope.onFileSelect = function($files) {
      var file = $files[0];
      // Check if the file has the right type
      if (FileSrv.validateImage(file.type)) {
        ngProgress.start();
        // Define the parameters to get the right signed request
        var params = {
          filetype: file.type,
          filesize: file.size,
          filename: file.name,
          accountId: $scope.account.id,
          type: 'image'
        };
        // Request a signed request
        FileSrv.signS3(params).then(function (signResponse) {
          if (signResponse.file) {
            // signed request is valid, send the file to S3
            uploadFile(signResponse, file);
          } else {
            toaster.pop('error', null, 'Sorry, there was an error. Details: ' +  signResponse.msg);
            console.log(signresponse);
          }
        })
      } else {
        toaster.pop('warning',null,'The file you chose is not valid. ' + file.type);
      }
    };


    /* ---------- INIT ----------------------------------------------------------------------------- */
    if ($stateParams.slug) {
      getAccount();
    } else {
      initiateNewAccount();
    }
  });
