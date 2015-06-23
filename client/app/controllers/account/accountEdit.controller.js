'use strict';

angular.module('columbyApp')

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountEditCtrl',
  function ($log, $window, $scope, $rootScope, $location, $state, $stateParams, $http, UserSrv, AccountSrv, CollectionSrv, ngNotify, $upload, FileService, ngProgress) {


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

        // handle result
        $window.document.title = 'columby.com | ' + result.name;
        $scope.account = result;
        $scope.contentLoading = false;

        // initiate updated model
        $scope.accountUpdate = {
          name        : $scope.account.name,
          description : $scope.account.description
        };

        // check if current user can edit this account
        $scope.account.canEdit= USerSrv.canEdit('account',result);

        $scope.account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.account.avatar.shortid + '/' + $scope.account.avatar.filename;

        // update the header with the header image just fetched.
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
      $scope.account.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
      $scope.headerStyle = {
        'background-image': 'url(/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */

    /**
     * Update an existing account
     *
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
              ngNotify.set('Account updated.');
            } else {
              ngNotify.set('There was an error updating the account name.','error');
            }
          });
        }
      }
    };


    $scope.startUpload = function(files,type,target){
      var file = files[0];
      $scope.fileUpload = {
        type: type,
        target: target
      };

      // Check if there is a file
      if (!file) { return ngNotify.set('No file selected.','error'); }
      console.log('Yes there is a file. ');

      // Check if there is already an upload in progress
      if ($scope.upload && $scope.upload.file) {
        return ngNotify.set('There is already an upload in progress.','error');
      }
      console.log('There is not already an upload in progress. ');

      // Check if the file has the right type
      if (!FileService.validateFile(file.type,type,target)) {
        return ngNotify.set('The file you chose is not valid. ' + file.type, 'error');
      }
      console.log('File is valid. ');

      $scope.upload = {
        file: file
      };

      ngProgress.color('#2FCCFF');
      ngProgress.start();
      var params = {
        filetype: file.type,
        filesize: file.size,
        filename: file.name,
        accountId: $scope.account.id,
        type: type,
        target: target
      };

      $upload.upload({
        method: 'POST',
        url   : $rootScope.config.filesRoot + '/upload',
        fields: params,
        file  : file,
      })

      .progress(function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        //console.log('progress: ' + progressPercentage + '% for ' + evt.config.file.name);
        ngProgress.set(progressPercentage);
      })

      .success(function (data, status, headers, config) {
        //console.log('File ' + config.file.name + 'uploaded.');
        //console.log('Data', data);
        // File upload is done
        if (data.status === 'ok') {
          ngProgress.complete();
          // finish
          $scope.upload.file = null;
          ngNotify.set('File uploaded.');
          console.log('File uploaded: ', data);

          var updated = {
            id: $scope.account.id
          };

          switch(target){
            case 'header':
              console.log('updating header image');
              $scope.account.headerImg = data.file;
              $scope.account.headerimg_id = data.file.id;
              updateHeaderImage();
              updated.headerimg_id = data.file.id;
              break;
            case 'avatar':
              console.log('Updating avatar. ');
              $scope.account.avatar_id = data.file.id;
              $scope.account.avatar = data.file;
              $scope.account.avatar.url = $rootScope.config.filesRoot + '/a/' + data.file.shortid + '/' + data.file.filename;
              console.log('Account avatar: ' + $scope.account.avatar.url);
              //console.log('updating avatar');
              updated.avatar_id = data.file.id;
              break;
            case 'accountFile':
              console.log('updating account file');
              AccountSrv.addFile(data.file, function(result){
                $log.log('result: ', result);
                $scope.account.files.push(result);
              });
              break;
          }
          $scope.fileUpload = null;
          ngNotify.set('File uploaded, updating account...');
          console.log('updating, ', updated);

          // Update Account at server
          AccountSrv.update({slug: $scope.account.slug}, updated, function(result){
            $log.log('Account updated, ', result);
          });

        } else {
          $scope.upload.file = null;
          return ngNotify.set('Something went wrong finishing the upload. ','error');
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
          ngNotify.set('There was an error creating the collection. ','error');
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
