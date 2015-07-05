'use strict';

angular.module('columbyApp')

/**
 *
 * Account Edit Controller
 *
 **/
  .controller('AccountEditCtrl',
  function ($rootScope, $scope, $stateParams, AccountSrv, CollectionSrv, ngNotify, $upload, FileService, ngProgress) {


    /* ---------- SETUP ----------------------------------------------------------------------------- */
    $scope.contentLoading  = true;
    $rootScope.title = 'columby.com';
    $scope.activePanel = 'profile';


    /* ---------- FUNCTIONS ------------------------------------------------------------------------- */
    function getAccount(){
      //console.log($stateParams);
      // get account information of user by userSlug
      AccountSrv.get($stateParams.slug).then(function(result){
        console.log('Fetched result: ' , result);
        $scope.contentLoading = false;

        // redirect primary accout to user edit page
        if (result.account.primary){
          console.log('forward from account to user edit page.');
          $state.go('userEdit',{slug: $stateParams.slug});
        }

        // handle result
        $rootScope.title = 'columby.com | ' + result.account.displayName;
        $scope.account = result.account;
        // set reference model to check for changes
        $scope.originalAccount = angular.copy($scope.account);

        if ($scope.account.avatar) {
          $scope.account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.account.avatar.shortid + '/' + $scope.account.avatar.filename;
        };

        // update the header with the header image just fetched.
        if ($scope.account.headerImg) {
          console.log('updating header image. ');
          updateHeaderImage();
        }

      });
    }

    function updateHeaderImage(){
      $scope.account.headerImg.url = $rootScope.config.filesRoot + '/a/' + $scope.account.headerImg.shortid + '/' + $scope.account.headerImg.filename;
      $scope.headerStyle = {
        'background-image': 'url(/images/default-header.png), url(' + $scope.account.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    // Change the active panel when a user clicks on a menu-link
    $scope.changePanel = function(panel) {
      $scope.activePanel = panel;
    }


    //Update an existing account
    $scope.update = function(){
      // check for update
      if (angular.equals($scope.account, $scope.originalAccount) === false){
        // send to server
        AccountSrv.update($scope.account).then(function(result){
          if (result.id){
            $scope.account = result;
            $scope.originalAccount = angular.copy($scope.account);
            ngNotify.set('Account updated.','notice');
          } else {
            ngNotify.set('There was an error updating the account name.','error');
          }
        });
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


    // Create a new collection for this account
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
    getAccount();

  })

  .controller('AccountEditOptionsCtrl', function($modalInstance, AccountSrv) {

  });
