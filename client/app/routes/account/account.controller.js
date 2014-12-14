'use strict';

angular.module('columbyApp')

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountCtrl',
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
        //console.log('no collections');
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
        if ($scope.account.avatar) {
          $scope.account.avatar.url = '/api/v2/file/' + $scope.account.avatar.id + '?style=small';
        }
        $scope.contentLoading = false;
        $window.document.title = 'columby.com | ' + result.name;

        $scope.account.canEdit = AuthSrv.canEdit('account', result);

        if ($scope.account.headerImg) {
          updateHeaderImage();
        }

        getCollections();
        getDatasets();
      }
    });

    }
    function updateHeaderImage(){
      $scope.account.headerImg.url = '/api/v2/file/' + $scope.account.headerImg.id + '?style=large';
      $scope.headerStyle={
        'background-image': 'url(/assets/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
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

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountEditCtrl',
  function ($window, $scope, $rootScope, $location, $state, $stateParams, $http, AuthSrv, AccountSrv, toaster, $upload, FileSrv, ngProgress) {


    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $scope.showOptions = false;
    $window.document.title = 'columby.com';

    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getAccount(){
      //console.log($stateParams);
      // get account information of user by userSlug
      AccountSrv.get({slug: $stateParams.slug}, function(result){
        $scope.account = result;
        $scope.account.avatar.url = '/api/v2/file/' + $scope.account.avatar.id + '?style=small';
        $scope.contentLoading = false;
        $window.document.title = 'columby.com | ' + result.name;

        $scope.accountUpdate = {
          name        : $scope.account.name,
          description : $scope.account.description
        };

        $scope.account.canEdit= AuthSrv.canEdit('account',result);

        if ($scope.account.headerImg) {
          updateHeaderImage();
        }

      });
    }

    function initiateNewAccount(){
      $scope.account = {
        name        : 'New account',
        description : '<p>Account description</p>',
        owner       : $rootScope.user.id,
        canEdit     : true
      };
      $scope.contentLoading = false;
      console.log('account initiated', $scope.account);
    }

    function updateHeaderImage(){
      $scope.account.headerImg.url = '/api/v2/file/' + $scope.account.headerImg.id + '?style=large';
      $scope.headerStyle = {
        'background-image': 'url(/assets/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }

    /**
     * Upload a file with a valid signed request
     *
     * @param params
     * @param file
     */
    function uploadFile(params, file) {
      console.log('params ', params);
      console.log('file ', file);
      file.filename = params.file.filename;

      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      // Populate the Post paramters.
      //console.log('Key: ' + params.file.account_id + '/images/' + params.file.filename);
      fd.append('key', params.credentials.file.key);
      fd.append('AWSAccessKeyId', params.credentials.s3Key);
      fd.append('acl', params.credentials.file.acl);
      //fd.append('success_action_redirect', "https://attachments.me/upload_callback")
      fd.append('policy', params.credentials.policy);
      fd.append('signature', params.credentials.signature);
      fd.append('Content-Type', params.credentials.file.filetype);
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

    /**
     * File is uploaded, finish it at the server.
     * @param params
     */
    function finishUpload(params){
      console.log('finishUpload, ', params);
      FileSrv.finishS3(params).then(function(res){
        //console.log('Finish upload res', res);
        if (res.url) {
          //console.log('updating url',res.url);
          //console.log($scope.fileUpload.target);
          var updated={
            id: $scope.account.id,
            slug: $scope.account.slug
          };
          switch($scope.fileUpload.target){
            case 'header':
              console.log('updating header image');
              $scope.account.headerImg = res;
              updated.headerImg=res.id;
              console.log($scope.account);
              updateHeaderImage();
              break;
            case 'avatar':
              $scope.account.avatar = '/api/v2/file/' + res.id + '?style=small';
              //console.log('updating avatar');
              updated.avatar = res.id;
              break;
          }
          $scope.fileUpload = null;
          toaster.pop('notice',null,'File uploaded, updating account');

          // Update Account at server
          AccountSrv.update(updated, function(result){});

        } else {
          $scope.fileUpload = null;
        }
      });
    }

    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.update = function(){
    console.log('$cope.update()');
    if (!$scope.account.id) {
      console.log('Name changed, but not yet saved');
    } else {
      var changed = false;
      var account = {
        id: $scope.account.id,
        slug: $scope.account.slug
      };
      if ($scope.accountUpdate.name !== $scope.account.name) {
        console.log('The account name was changed. ');
        changed = true;
        account.name = $scope.accountUpdate.name;
        console.log(account.name);
        console.log($scope.accountUpdate.name);
      }
      if ($scope.accountUpdate.description !== $scope.account.description) {
        console.log('The account description was changed. ');
        changed = true;
        account.description = $scope.accountUpdate.description;
      }
      if (changed) {
        console.log('Updating account', account);
        AccountSrv.update(account, function(result){
          console.log(result);
          if (result.id){
            $scope.accountUpdate.name = result.name;
            $scope.accountUpdate.description = result.description;
            $scope.account.name = result.name;
            $scope.account.description = result.description;
            toaster.pop('success', null, 'Account updated.');
          } else {
            toaster.pop('warning', null, 'There was an error updating the account name.');
          }
        });
      }
    }
  };


    /**
     *
     * Handle file select
     *
     * @param $files
     */
    $scope.onFileSelect = function($files, target) {
      var file = $files[0];
      if ($scope.upload){
        toaster.pop('warning',null,'There is already an upload in progress. ');
      } else if (!file) {
        console.log('No file selected. ');
      } else {
        // Check if the file has the right type
        if (FileSrv.validateImage(file.type)) {
          $scope.fileUpload = {
            file:file,
            target:target
          };
          //console.log($scope.fileUpload);
          ngProgress.start();
          // Define the parameters to get the right signed request
          //console.log($scope.account.shortid);
          var params = {
            filetype: file.type,
            filesize: file.size,
            filename: file.name,
            accountId: $scope.account.id,
            type: 'image'
          };
          console.log('Uploading with params: ', params);
          // Request a signed request
          FileSrv.signS3(params).then(function (signResponse) {
            if (signResponse.file) {
              // signed request is valid, send the file to S3
              uploadFile(signResponse, file);
            } else {
              toaster.pop('error', null, 'Sorry, there was an error. Details: ' +  signResponse.msg);
              console.log(signresponse);
            }
          });
        } else {
          toaster.pop('warning', null, 'The file you chose is not valid. ' + file.type);
        }
      }
    };

    $scope.toggleOptions = function() {
      console.log('toggleOptions');
      $scope.showOptions = !$scope.showOptions;
    };

    /* ---------- INIT ----------------------------------------------------------------------------- */
    if ($stateParams.slug) {
      getAccount();
    } else {
      initiateNewAccount();
    }
  });
