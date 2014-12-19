'use strict';

angular.module('columbyApp')

  .directive('distributionPopup', function($rootScope, EmbedlySrv, DistributionSrv, ngDialog, FileSrv, toaster, ngProgress){
    return {
      templateUrl: 'app/directives/distributionPopup/distributionPopup.html',
      restrict: 'EA',
      scope: {
        dataset: '='
      },

      controller: function($scope){

        /* Initialize */
        $scope.upload = {
          inProgress: false,
          finished: false
        };
        $scope.wizard={
          step:1
        };
        $scope.licenseToggle = {
          isopen: false
        };


        /**
         * File is uploaded, finish it at the server.
         *
         * @param params
         */
        function finishUpload(params){
          FileSrv.finishS3(params).then(function(res){
            console.log('res', res);
            if (res.id) {
              $scope.upload.file = null;
              toaster.pop('notice',null,'File uploaded, updating distribution');

              // Update distribution with the uploaded file.
              $scope.distribution.file_id = res.id;
              $scope.distribution.byteSize = res.size;
              $scope.distribution.mediaType = res.filetype;

              DistributionSrv.update($scope.distribution, function(response){
                console.log(response);
                // Go to the next step.
                $scope.wizard.step = 4;
                $scope.upload.finished = true;
              });

            } else {
              $scope.upload.file = null;
            }
          });
        }

        /**
         *
         * Upload a file with a signed request.
         *
         */
        function uploadFile(){
          var params = $scope.upload.s3response;
          var file = $scope.upload.file;
          file.filename = params.file.filename;

          var xhr = new XMLHttpRequest();
          var fd = new FormData();
          // Populate the Post parameters.
          fd.append('key', params.credentials.file.key);
          fd.append('AWSAccessKeyId', params.credentials.s3Key);
          fd.append('acl', params.credentials.file.acl);
          fd.append('policy', params.credentials.policy);
          fd.append('signature', params.credentials.signature);
          fd.append('Content-Type', params.file.filetype);
          fd.append('success_action_status', '201');
          // This file object is retrieved from a file input.
          fd.append('file', file);

          // Upload progress
          xhr.upload.addEventListener('progress', function (evt) {
            ngProgress.set(parseInt(100.0 * evt.loaded / evt.total));
            $scope.distribution.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
          }, false);

          // Upload done
          xhr.addEventListener('load', function(evt){
            ngProgress.complete();
            $scope.distribution.uploadProgress = 100;
            var parsedData = FileSrv.handleS3Response(evt.target.response);
            var p = {
              fid: params.file.id,
              url: parsedData.location
            };
            finishUpload(p);
          });
          xhr.addEventListener('error', function(evt){
            ngProgress.complete();
            $scope.distribution.uploadProgress = 0;
            toaster.pop('warning',null,'There was an error attempting to upload the file.' + evt);
          }, false);
          xhr.addEventListener('abort', function(){
            ngProgress.complete();
            $scope.distribution.uploadProgress = 0;
            toaster.pop('warning',null,'The upload has been canceled by the user or the browser dropped the connection.');
          }, false);

          xhr.open('POST', 'https://' + params.credentials.bucket + '.s3.amazonaws.com/', true);
          xhr.send(fd);
        }

        function initiate() {
          $scope.distribution = {
            dataset_id: $scope.dataset.id
          };

          DistributionSrv.save($scope.distribution, function(res){
            if (res.id){
              $scope.distribution = res;
              $scope.dataset.distributions.push(res);
              toaster.pop('success', null, 'New source created.');
              ngDialog.open({
                template: 'app/directives/distributionPopup/distributionPopupContent.html',
                className: 'ngdialog-theme-default fullscreenDialog',
                scope: $scope
              });
            } else {
              toaster.pop('danger', null, 'Something went wrong.');
            }
          });
        }

        function closeDistribution(){
          ngDialog.closeAll();
          toaster.pop('info', null, 'Datasource added. ');
        }


        /** ---------- SCOPE FUNCTIONS ------------------------------------------------ **/
        $scope.initUpload = function(){
          $scope.distribution.type = 'file';
          $scope.wizard.step = 2;
        };

        $scope.onFileSelect = function(files) {
          $scope.uploadInProgress = true;
          if (files[0]) {
            $scope.upload.file = files[0];
            // Check file properties

            var f = {
              filetype: $scope.upload.file.type,
              type: 'datafile',
              filename: $scope.upload.file.name,
              filesize: $scope.upload.file.size,
              accountId: $scope.dataset.account.id
            };

            FileSrv.signS3(f).then(function(response){
              if (response.credentials){
                $scope.upload.s3response = response;
                uploadFile();
              } else {
                console.log(response);
              }
            });
          } else {
            $scope.uploadInProgress = false;
          }
        };

        $scope.updateMetadata = function(){

          $scope.updateInProgress = true;
          // save metadata
          DistributionSrv.update($scope.distribution, function(response){
            $scope.updateInProgress = true;
            if (response.id){
              // all is well, next step.
              // close distribution
              closeDistribution();
            } else {
              toaster.pop('warning', null, 'Something went wrong. ' + response);
            }
          });



          // if source is readable, process dialog

          // else continue to distribution

        };

        $scope.initSync = function(){
          $scope.distribution.type = 'sync';
          $scope.wizard.step = 3;
        };







        $scope.checkLink = function(){
          // validate
          $scope.newDistribution.validationMessage = 'The link was validated!';
          $scope.newDistribution.distributionType = 'link';
          $scope.newDistribution.valid = true;
        };

        $scope.createDistribution = function() {
          //console.log('Creating ditribution');
          // validate link
          if ($scope.newDistribution){
            if ($scope.newDistribution.valid) {
              // add link to model
              if (!$scope.dataset.hasOwnProperty('distributions')) {
                $scope.dataset.distributions = [];
              }

              var distribution = {
                // Columby Stuff
                uploader          : $rootScope.user.id,
                distributionType  : $scope.newDistribution.distributionType,
                publicationStatus : 'public',
                // DCAT stuff
                accessUrl         : $scope.newDistribution.link
              };
              //console.log('attaching distribution', distribution);

              DatasetDistributionSrv.save({
                  id:$scope.dataset.id,
                  distribution: distribution}, function(res){
                  //console.log('res', res);
                  if (res.id){
                    $scope.dataset.distributions.push(res.distribution);
                    toaster.pop('success', 'Updated', 'New dataset added.');
                    $scope.distribution = res;
                  } else {
                    toaster.pop('danger', 'Error', 'Something went wrong.');
                  }
                }
              );
            }
          } else {
            toaster.pop('danger', 'Error', 'No new distribution attached');
          }
        };

        //initNew
        $scope.initNewDistribution = function() {
          initiate();
        };

        //initiate();
      }
    };
  });
