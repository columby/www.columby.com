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
    $scope.datasets = {
      currentPage:1,
      numberOfItems:10
    };

    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getCollections(){
      if ($scope.account.Collections && $scope.account.Collections.length >0){
        $scope.account.collections = [];
        angular.forEach($scope.account.Collections, function(value, key) {
          CollectionSrv.get({id:value.shortid}, function(result){
            $scope.account.collections[ key] = result;
          });
        });
        delete $scope.account.Collections;
        console.log($scope.account.collections);
      } else {
        //console.log('no collections');
      }
    }

    function getDatasets(){
      $scope.datasets.loading = true;
      var offset = ($scope.datasets.currentPage -1) *10;
      DatasetSrv.index({accountId: $scope.account.id, offset:offset}, function(d){
        $scope.datasets.rows = d.rows;
        $scope.datasets.count = d.count;
        $scope.datasets.loading = false;
      });

    }

    function getAccount(){

    // get account information of user by userSlug
    AccountSrv.get({slug: $stateParams.slug}, function(result){
      if (!result.id){
        toaster.pop('warning', null, 'The requested account was not found. ');
        $state.go('home');
      } else {
        console.log(result);
        $scope.account = result;
        if ($scope.account.avatar) {
          $scope.account.avatar.url = $rootScope.config.apiRoot + '/v2/file/' + $scope.account.avatar.id + '?style=small';
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
      $scope.account.headerImg.url = $rootScope.config.apiRoot + '/v2/file/' + $scope.account.headerImg.id + '?style=large';
      $scope.headerStyle={
        'background-image': 'url(/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.datasets.currentPage);
      getDatasets();
    };

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
  function ($log, $window, $scope, $rootScope, $location, $state, $stateParams, $http, AuthSrv, AccountSrv, CollectionSrv, toaster, $upload, FileService, ngProgress) {


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
        $log.log('Fetched result: ' , result);
        $scope.account = result;
        if (result.avatar){
          $scope.account.avatar.url = $rootScope.config.apiRoot + '/v2/file/' + $scope.account.avatar.id + '?style=small';
        } else {
          $scope.account.avatar = {};
        }
        $scope.contentLoading = false;
        $window.document.title = 'columby.com | ' + result.name;

        $scope.accountUpdate = {
          name        : $scope.account.name,
          description : $scope.account.description
        };

        $scope.account.canEdit= AuthSrv.canEdit('account',result);

        if ($scope.account.headerImg) {
          $log.log('updating header image. ');
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
      $scope.account.headerImg.url = $rootScope.config.apiRoot + '/v2/file/' + $scope.account.headerImg.id + '?style=large';
      $scope.headerStyle = {
        'background-image': 'url(/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    /**
     * File is uploaded, finish it at the server.
     * @param params
     */
    function finishUpload(){

      $log.log('fileUpload: ', $scope.fileUpload);
      var params = {
        fid: $scope.fileUpload.file.id,
        url: 'https://' + $scope.fileUpload.credentials.bucket + '.s3.amazonaws.com/' + $scope.fileUpload.credentials.file.key
      };
      $log.log('params', params);

      FileService.finishS3(params).then(function(res){
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
              $scope.account.avatar.url = $rootScope.config.apiRoot + '/v2/file/' + res.id + '?style=small';
              //console.log('updating avatar');
              updated.avatar = res.id;
              break;
            case 'accountFile':
              console.log('updating account file');
              AccountSrv.addFile($scope.fileUpload.file, function(result){
                $log.log('result: ', result);
                $scope.account.files.push(result);
              });
              break;
          }
          $scope.fileUpload = null;
          toaster.pop('notice',null,'File uploaded, updating account...');

          // Update Account at server
          AccountSrv.update(updated, function(result){
            $log.log('Account updated, ', result);
          });

        } else {
          $scope.fileUpload = null;
        }
      });
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    /**
     *
     * Update an existing account
     */
    $scope.update = function(){
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
     * Handle file select
     *
     * @param $files
     * @param target
     */
    $scope.onFileSelect = function($files, type, target) {

      var file = $files[0];

      $scope.fileUpload = {
        type: type,
        target: target
      };

      // Check if there is a file
      if (!file) {
        return toaster.pop('warning',null,'No file selected.');
      }
      // Check if there is already an upload in progress
      if ($scope.upload){
        return toaster.pop('warning',null,'There is already an upload in progress. ');
      }
      // Check if the file has the right type
      if (!FileService.validateFile(file.type,type,target)) {
        return toaster.pop('warning', null, 'The file you chose is not valid. ' + file.type);
      }

      ngProgress.start();
      var params = {
        filetype: file.type,
        filesize: file.size,
        filename: file.name,
        accountId: $scope.account.id,
        type: type,
        target: target
      };

      console.log('Uploading with params: ', params);
      // Sign the upload request
      FileService.signS3(params).then(function(signedResponse) {
        console.log('Response sign: ', signedResponse);
        // signed request is valid, send the file to S3
        if (signedResponse.file) {
          // Initiate the upload
          FileService.upload($scope, signedResponse, file).then(function(res){
            // File upload is done
            if (res.status === 201 && res.statusText==='Created') {
              ngProgress.complete();
              $log.log($scope.fileUpload);
              $scope.fileUpload.file = signedResponse.file;
              $scope.fileUpload.credentials = signedResponse.credentials;
              console.log('Finishing uploading. ');

              finishUpload();
            } else {
              return toaster.pop('warning',null,'Something went wrong finishing the upload. ');
            }
          }, function(error){
            console.log('Error', error);

          }, function(evt) {
            console.log('Progress: ' + evt.value);
            ngProgress.set(evt.value);
          });
        } else {
          toaster.pop('error', null, 'Sorry, there was an error. Details: ' +  signedResponse.msg);
          console.log(signedResponse);
        }
      });
    };

    // Toggle account options menu
    $scope.toggleOptions = function() {
      console.log('toggleOptions');
      $scope.showOptions = !$scope.showOptions;
    };

    /**
     * Create a new collection for this account
     */
    $scope.newCollection = function(){
      CollectionSrv.save({
        accountId: $scope.account.id,
        title: $scope.newCollection.title
      }, function(result){
        if (result.id){
          $scope.account.Collections.push(result);
          $scope.newCollection = null;
        } else {
          toaster.pop('warning', null, 'There was an error creating the collection. ');
        }
      });
    };


    /* ---------- INIT ----------------------------------------------------------------------------- */
    if ($stateParams.slug) {
      getAccount();
    } else {
      initiateNewAccount();
    }
  });
