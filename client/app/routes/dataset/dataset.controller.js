'use strict';

angular.module('columbyApp')

  .controller('DatasetViewCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DistributionSrv, DatasetReferenceSrv, AuthSrv, toaster, ngDialog) {

    /* --------- INITIALISATION ------------------------------------------------------------ */
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.embedUrl = $location.absUrl();
    $window.document.title = 'columby.com';


    /* --------- FUNCTIONS ------------------------------------------------------------------ */
    /**
     * Fetch a dataset
     *
     */
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset
      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.contentLoading = false;
        $scope.dataset = dataset;
        $window.document.title = 'columby.com | ' + dataset.title;

        // transition the url from slug to id
        if ($stateParams.id !== dataset.shortid) {
          $state.transitionTo ('dataset.view', { id: dataset.shortid}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // // create summary
        // var summary = '<p>';
        // // check for file source
        // if (!dataset.sources) {
        //   summary += 'There is no data for this dataset available yet. ';
        // } else if (!dataset.sources.primary) {
        //   summary += 'There is no primary source for this dataset yet. ';
        // } else if (dataset.sources.primary.type) {
        //   summary += 'This dataset if of the type <strong>' + dataset.sources.primary.type + '</strong>.';
        // }
        // $scope.summary = summary + '</p>';

        $scope.dataset.canEdit= AuthSrv.canEdit('dataset', dataset);

        if ($scope.dataset.headerImg && $scope.dataset.headerImg.url) {
          updateHeaderImage();
        }
      });
    }

    /**
     * Update the header image of a dataset
     */
    function updateHeaderImage(){
			if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = '/api/v2/file/' + $scope.dataset.headerImg.id + '?style=large';
        console.log('Updating header image: ', $scope.dataset.headerImg.url);

	      $scope.headerStyle={
	        'background-image': 'linear-gradient(transparent,transparent), url(/assets/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
	        'background-blend-mode': 'multiply'
	      };
	    }
    }


    /* --------- SCOPE FUNCTIONS ------------------------------------------------------------ */
    $scope.showEmbedModal = function(){
      ngDialog.open({
        template: 'app/routes/dataset/partials/embedModal.html',
        className: 'ngDialog-theme-default fullscreenDialog embedModal',
        scope: $scope
      });
    };


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.id) {
      getDataset();
    } else {
      toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
      $state.go('home');
    }
  })


/**
 *
 *  Controller for a dataset Edit page
 *
 */
  .controller('DatasetEditCtrl', function($log,$window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DistributionSrv, PrimaryService, DatasetReferenceSrv, AuthSrv, TagService, toaster, Slug, ngDialog, $http, $upload, FileService,ngProgress, $timeout) {

    /*-------------------   INITIALISATION   ------------------------------------------------------------------*/
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.datasetUpdate = {};
    $scope.editMode = true;
    $window.document.title = 'columby.com';

    $scope.status = {
      isopen: false
    };

    /*-------------------   FUNCTIONS   -----------------------------------------------------------------------*/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset
      DatasetSrv.get({
        id: $stateParams.id
      }, function(dataset) {
        if (!dataset.id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }

        // transition the url from slug to id
        if ($stateParams.id !== dataset.shortid) {
          $state.transitionTo ('dataset.view', { id: dataset.shortid}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // Update document title
        $window.document.title = 'columby.com | ' + dataset.title;
        $scope.contentLoading = false;

        // Update image styles
        if (dataset.headerImg){
          dataset.headerImg.url = $rootScope.config.aws.endpoint + dataset.account.id + '/images/styles/large/' + dataset.headerImg.filename;
        }

        // Make sure there is a reference array
        if (!dataset.references){
          dataset.references = [];
        }

        // Add the dataset to the scope
        $scope.dataset = dataset;

        // set draft title and description
        $scope.datasetUpdate.title = $scope.dataset.title;
        $scope.datasetUpdate.description = $scope.dataset.description;

        // Update the header image
        if ($scope.dataset.headerImg){
          updateHeaderImage();
        }

      });
    }

    /**
     * File is uploaded, finish it at the server.
     *
     * @param params
     */
    function finishUpload(params){
      FileService.finishS3(params).then(function(res){
        console.log('res', res);
        if (res.url) {
          console.log('updating url',res.url);
          console.log($scope.fileUpload.target);
          var updated = {
            id  : $scope.dataset.id
          };
          switch($scope.fileUpload.target){
            case 'header':
              $scope.dataset.headerImg = res;
              updated.headerImg=res.id;
              updateHeaderImage();
              break;
          }
          $scope.fileUpload = null;
          toaster.pop('notice',null,'File uploaded, updating account');

          DatasetSrv.update(updated, function(result){
            //console.log('update', result);
            //toaster.pop('notice',null,'File uploaded!');
          });
        } else {
          $scope.fileUpload = null;
        }
      });
    }

    /**
     * Upload a file with a valid signed request
     *
     * @param params
     * @param file
     */
    //function uploadFile(params, file) {
    //
    //  file.filename = params.file.filename;
    //  console.log('url: ' + params.file.account_id + '/images/' + params.file.filename);
    //  var xhr = new XMLHttpRequest();
    //  var fd = new FormData();
    //  // Populate the Post paramters.
    //  fd.append('key', params.credentials.file.key);
    //  fd.append('AWSAccessKeyId', params.credentials.s3Key);
    //  fd.append('acl', params.credentials.file.acl);
    //  //fd.append('success_action_redirect', "https://attachments.me/upload_callback")
    //  fd.append('policy', params.credentials.policy);
    //  fd.append('signature', params.credentials.signature);
    //  fd.append('Content-Type', params.file.filetype);
    //  fd.append('success_action_status', '201');
    //  // This file object is retrieved from a file input.
    //  fd.append('file', file);
    //
    //  xhr.upload.addEventListener('progress', function (evt) {
    //    ngProgress.set(parseInt(100.0 * evt.loaded / evt.total));
    //  }, false);
    //
    //  xhr.addEventListener('load', function(evt){
    //    ngProgress.complete();
    //    var parsedData = FileService.handleS3Response(evt.target.response);
    //    var p = {
    //      fid: params.file.id,
    //      url: parsedData.location
    //    };
    //    console.log('url: ' + parsedData.location);
    //    finishUpload(p);
    //  });
    //  xhr.addEventListener('error', function(evt){
    //    ngProgress.complete();
    //    toaster.pop('warning',null,'There was an error attempting to upload the file.' + evt);
    //  }, false);
    //  xhr.addEventListener("abort", function(){
    //    ngProgress.complete();
    //    toaster.pop('warning',null,'The upload has been canceled by the user or the browser dropped the connection.');
    //  }, false);
    //
    //  xhr.open('POST', 'https://' + params.credentials.bucket + '.s3.amazonaws.com/', true);
    //  xhr.send(fd);
    //}

    /**
     * Start with a new dataset, published on the user's primary account.
     *
     */
    function initiateNewDataset(){

      // if user has multiple accounts, show the account-selector.
      if ($rootScope.user.accounts.length > 1) {
        $scope.showAccountSelector = true;
      }

      //dataset.account.avatar.url
      $scope.dataset = {
        title: null,
        description: null,
        account: $rootScope.user.accounts[ 0],
        account_id: $rootScope.user.accounts[ 0].id,
        canEdit: true
      };

      toaster.pop('notice',null,'Here\'s your new dataset!');
    }

    /**
     * Update the header background image
     *
     */
    function updateHeaderImage(){

      $scope.dataset.headerImg.url = '/api/v2/file/' + $scope.dataset.headerImg.id + '?style=large';
      $scope.headerStyle = {
        'background-image': 'url(/assets/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }


    /*-------------------   SCOPE FUNCTIONS   -----------------------------------------------------------------*/

    /**
     * Initiate the account change popup
     *
     */
    $scope.toggleAccountSelector = function(){
      $scope.showAccountSelector = !$scope.showAccountSelector;
    };

    /**
     * Change the owner of the dataset.
     *
     * @param id
     */
    $scope.updateDatasetOwner = function(id){
      console.log(id);
      $scope.dataset.account_id = $rootScope.user.accounts[ id].id;
      $scope.dataset.account = $rootScope.user.accounts[ id];
      $scope.showAccountSelector = false;
    };

    /**
     *
     * Show or hide the options menu
     *
     */
    $scope.toggleOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    };

    /**
     *
     * Toggle private mode for a dataset.
     *
     * @param status
     */
    $scope.toggleDatasetPrivacy = function(){
      var newStatus = !$scope.dataset.private;
      $scope.dialogMsg = 'Setting visibility status to ' + !newStatus;
      var dataset = {
        id: $scope.dataset.id,
        private: newStatus
      };
      DatasetSrv.update({id: dataset.id}, dataset, function(res){
        if (res.id){
          $scope.dataset.private = newStatus;
          toaster.pop('success', null, 'Dataset visibility status updated to  ' + newStatus);
        } else {
          toaster.pop('error', null, 'There was an error updating the setting.');
        }
      });
    };

    /**
     * Handle file select
     *
     * @param $files
     * @param type (file, image, datafile)
     * @param target (headerImage, accountFile, avatar)
     */
    $scope.onFileSelect = function($files, type, target) {
      var file = $files[0];
      if ($scope.upload){
        toaster.pop('warning',null,'There is already an upload in progress. ');
      } else {
        // Check if the file has the right type
        if (FileService.validateFiletype(file.type, type, target)) {
          $scope.fileUpload = {
            file:file,
            target:target
          };
          // Initiate the progress bar
          ngProgress.start();
          // Define the parameters to get the right signed request
          var params = {
            filetype: file.type,
            filesize: file.size,
            filename: file.name,
            accountId: $scope.dataset.account.id,
            type: type
          };
          $log.log(params);

          // Request a signed request
          FileService.signS3(params).then(function (signResponse) {
            $log.log(signResponse);
            if (signResponse.file) {
              //console.log('signed response: ', signResponse);
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


    /**
     *
     * Create a new dataset
     *
     */
    $scope.create = function() {
      $scope.dataset.title = $scope.datasetUpdate.title;
      $scope.dataset.description = $scope.datasetUpdate.description;
      DatasetSrv.save($scope.dataset, function(res){
        console.log('New dataset received: ' + res.id);
        if (res.id) {
          toaster.pop('success', null, 'Your dataset page is created. Now add some data.');
          $state.go('dataset.edit', {id:res.shortid});
        }
      });
    };

    /**
     *
     * Update an existing dataset.
     *
     */
    $scope.update = function(){
      if (!$scope.dataset.id) {
        console.log('unpublished. ');
      } else {
        var changed = false;
        var dataset = {
          id: $scope.dataset.id,
          title: $scope.dataset.title,
          description: $scope.dataset.description
        };
        if (dataset.title !== $scope.datasetUpdate.title) {
          console.log('name changed');
          dataset.title = $scope.datasetUpdate.title;
          changed = true;
        }
        if (dataset.description !== $scope.datasetUpdate.description){
          console.log('description changed');
          dataset.description = $scope.datasetUpdate.description;
          changed = true;
        }
        if (changed){
          DatasetSrv.update({id: dataset.id}, dataset,function(res){
            if (res.id){
              $scope.datasetUpdate.title = result.title;
              $scope.datasetUpdate.description = result.description;
              toaster.pop('success', null, 'Dataset updated.');
            } else {
              toaster.pop('warning', null, 'There was an error updating the dataset.');
            }
          });
        }
      }
    };

    $scope.updateSlug = function(){
      var slug = Slug.slugify($scope.dataset.slug);
      var d={
        id: $scope.dataset.id,
        slug: slug
      };
      DatasetSrv.update({id: d.id}, d, function(res){
        //console.log(res);
        if (res.id) {
          $scope.dataset.slug = res.slug;
          toaster.pop('success', 'Updated', 'Dataset custom URL updated.');
        } else if (res.err && res.err.errors.slug){
          toaster.pop('error', 'Update error', 'There was an error setting the custom URL: ' + res.err.errors.slug.message);
        } else {
          toaster.pop('error', 'Update error', 'There was an error updating the custom URL.');
        }
      });
    };


    $scope.confirmDeleteReference = function(index){
      $scope.dataset.references[ index].confirmDelete = true;
    };

    /**
     *
     * Delete an attached reference
     *
     * @param index
     */
    $scope.deleteReference = function(index){
      console.log(index);
      var id = $scope.dataset.id;
      var referenceId = $scope.dataset.references[ index].id;

      DatasetReferenceSrv.delete({id:id, rid:referenceId}, function(res){
        if (res.status === 'success') {
          $scope.dataset.references.splice(index,1);
          toaster.pop('success', null, 'Reference deleted.');
        } else {
          toaster.pop('success', null, 'There was a problem deleting the reference.');
        }
      });

    };

    /**
     *
     * Confirm the deletion of a distribution
     *
     * @param index
     */
    $scope.confirmDeleteDistribution = function(index){
      $scope.dataset.distributions[ index].confirmDelete = true;
      // turn the confirmation off automatically
      $timeout(function(){$scope.dataset.distributions[ index].confirmDelete = false}, 5000);
    };

    /**
     *
     * Delete a distriubtion from the server
     *
     * @param index
     */
    $scope.deleteDistribution = function(distribution){
      var idx = $scope.dataset.distributions.indexOf(distribution);
      DistributionSrv.delete({id: $scope.dataset.distributions[ idx].id}, function(res){
        if (res.status === 'success') {
          $scope.dataset.distributions.splice(idx,1);
          toaster.pop('success', 'Done', 'Distribution deleted.');
        } else {
          toaster.pop('danger', null, 'There was a problem deleting the distribution.');
        }
      });
    };

    /**
     *
     * Handle Primary Source Initialization
     *
     * @param $files
     */
    $scope.addSource = function(){
      console.log('yyyy');

    };

    /**
     *
     * Handle the request to convert a distribution to a primary source.
     *
     * @param dist
     */
    $scope.convertPrimary = function(dist){
      var idx = $scope.dataset.distributions.indexOf(dist);
      $scope.newPrimary = {
        dataset_id: $scope.dataset.id,
        distribution_id: $scope.dataset.distributions[ idx].id,
        syncPeriod: null
      };
      console.log('newPrimary: ', $scope.newPrimary);
      // Open the dialog
      ngDialog.openConfirm({
        template: 'app/routes/dataset/partials/addPrimarySource.html',
        controller: 'DatasetEditCtrl',
        scope: $scope
      }).then(function(value){
        PrimaryService.save(value, function(result){
          if (result.id){
            ngDialog.closeAll();
            toaster.pop('success',null,'The primary source was created successfully');
            $scope.dataset.primary = result;

          } else {
            toaster.pop('warning',null,'There was an error creating the primary source.');
          }
        });
      },function(reject){
        console.log(reject);
      });
    };

    /**
     * Create a new primary source
     */
    $scope.createPrimary = function(){
      var primary = {
        syncperiod: $scope.newPrimary.syncPeriod,
        dataset_id: $scope.newPrimary.dataset_id,
        distribution_id: $scope.newPrimary.distribution_id
      };
      console.log('new Primary: ', primary);

    };

    /**
     * Delete a primary source
     */
    $scope.deletePrimary = function(){
      if ($scope.dataset.primary.id){
        PrimaryService.delete({id: $scope.dataset.primary.id}, function(result){
          console.log(result);
          if (result.status === 'success'){
            $scope.dataset.primary = null;
            toaster.pop('success',null,'The primary source was deleted successfully');
          } else {
            toaster.pop('warning',null,'There was an error deleting the primary source.');
          }
        })
      }
    }

    $scope.closeDialog = function(){
      ngDialog.closeAll();
    };

    $scope.updateHeaderImage = function($files) {
      $scope.upload=[];
      var file = $files[0];
      file.progress = parseInt(0);
      //console.log('file', file);

      // check if the file is an image
      var validTypes = [ 'image/png', 'image/jpg', 'image/jpeg' ];

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
          accountId: $scope.dataset.account.id
        }
      })
        .success(function(response){
          var s3Params = response.credentials;
          var fileResponse = response.file;
          // Initiate upload
          $scope.upload = $upload.upload({
            url: 'https://s3.amazonaws.com/' + $rootScope.config.aws.bucket,
            method: 'POST',
            data: {
              'key' : $scope.dataset.account.id + '/' + response.file.filename,
              'acl' : 'public-read',
              'Content-Type' : file.type,
              'AWSAccessKeyId': s3Params.AWSAccessKeyId,
              'success_action_status' : '201',
              'Policy' : s3Params.s3Policy,
              'Signature' : s3Params.s3Signature
            },
            file: file
          }).then(function(response) {
            //console.log(response.data);
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
                  fileId: fileResponse.id,
                  url: parsedData.location
                }
              })
              .success(function(response){
                //console.log('res', response);
                $scope.dataset.headerImage = response.url;
                var d = {
                  id: $scope.dataset.id,
                  headerImage: response.url
                };
                //console.log('datasetUpdate', d);
                DatasetSrv.update(d, function(result){
                  //console.log('r',result);
                  if (result.id) {
                    toaster.pop('success', 'Updated', 'Account updated.');
                    updateHeaderImage();
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


    $scope.loadTags = function(query) {
      //console.log('querying, ', query);
      //var r=TagService.query(query);
      //console.log(r);
    };
    $scope.addTag = function(tag){
      console.log('adding tag',tag);
      TagService.save(tag, function(result){
        tag.id=result.id;
        DatasetSrv.addTag({id:$scope.dataset.id, tagId:result.id}, function(result){
          console.log('dtaset addtag result: ', result);
        });
      });

    };
    $scope.removeTag = function(tag){
      console.log('removind tag, ', tag);
      DatasetSrv.removeTag({id:$scope.dataset.id, tagId:tag.id},function(result){
        console.log('dataset remove result: ', result);
      })
    };


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.id) {
      getDataset();
    } else {
      initiateNewDataset();
    }
  }
);
