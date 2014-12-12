'use strict';

angular.module('columbyApp')

  .controller('DatasetViewCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DatasetDistributionSrv, DatasetReferencesSrv, AuthSrv, toaster, ngDialog) {

    /***   INITIALISATION   ***/
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.embedUrl = $location.absUrl();
    $window.document.title = 'columby.com';


    /***   FUNCTIONS   ***/
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

        updateHeaderImage();

      });
    }

    function updateHeaderImage(){

			if ($scope.dataset.headerImg) {
        $scope.dataset.headerImg.url = '/api/v2/file/' + $scope.dataset.headerImg.id + '?style=small';
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
  }
)
  .controller('DatasetEditCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DatasetDistributionSrv, DatasetReferencesSrv, AuthSrv, toaster, Slug, ngDialog,EmbedlySrv, $http, $upload, FileSrv,ngProgress) {

    /***   INITIALISATION   ***/
    $scope.hostname = $location.protocol() + '://' + $location.host();
    $scope.datasetUpdate = {};
    $window.document.title = 'columby.com';

    /***   FUNCTIONS   ***/
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
        //console.log(dataset);
        // Update image styles
        dataset.headerImg.url = $rootScope.config.aws.endpoint + dataset.account.id + '/images/styles/large/' + dataset.headerImg.filename;;
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

        // set draft title and description
        $scope.datasetUpdate.title = $scope.dataset.title;
        $scope.datasetUpdate.description = $scope.dataset.description;

        if ($scope.dataset.headerImg){
          updateHeaderImage();
        }

      });
    }

    /**
     * Upload a file with a valid signed request
     *
     * @param params
     * @param file
     */
    function uploadFile(params, file) {

      file.filename = params.file.filename;
      console.log('url: ' + params.file.account_id + '/images/' + params.file.filename);
      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      // Populate the Post paramters.
      fd.append('key', params.file.account_id + '/images/' + params.file.filename);
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
        console.log('url: ' + parsedData.location);
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
     *
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

    $scope.changeAccount = function(){
      $scope.showAccountSelector = true;
    };

    $scope.updateDatasetOwner = function(id){
      console.log(id);
      $scope.dataset.account_id = $rootScope.user.accounts[ id].id;
      $scope.dataset.account = $rootScope.user.accounts[ id];
      $scope.showAccountSelector = false;
    };

    function updateHeaderImage(){

      $scope.dataset.headerImg.url = '/api/v2/file/' + $scope.dataset.headerImg.id + '?style=small';
      $scope.headerStyle = {
        'background-image': 'url(/assets/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
        'background-blend-mode': 'multiply'
      };
    }

    /***   SCOPE FUNCTIONS   ***/
    $scope.toggleOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    };

    /**
     *
     * Handle file select
     *
     * @param $files
     * @param target
     */
    $scope.onFileSelect = function($files, target) {
      var file = $files[0];
      if ($scope.upload){
        toaster.pop('warning',null,'There is already an upload in progress. ');
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
          var params = {
            filetype: file.type,
            filesize: file.size,
            filename: file.name,
            accountId: $scope.dataset.account.id,
            type: 'image'
          };
          // Request a signed request
          FileSrv.signS3(params).then(function (signResponse) {
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
     * File is uploaded, finish it at the server.
     * @param params
     */
    function finishUpload(params){
      FileSrv.finishS3(params).then(function(res){
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

    /* dataset functions */
    $scope.updateTitle = function() {
      if (!$scope.dataset.id) {
        //console.log('Title changed, but not yet saved');
      } else {
        if ($scope.datasetUpdate.title === $scope.dataset.title) {
          //console.log('Dataset saved, but no title change');
        } else {
          var dataset = {
            id: $scope.dataset.id,
            title: $scope.datasetUpdate.title
          };
          //console.log('updating dataset title', dataset);

          DatasetSrv.update({id:dataset.id},dataset,function(res){
            if (res.id){
              $scope.datasetUpdate.title = res.title;
              toaster.pop('success', null, 'Dataset title updated.');
            }
          });
        }
      }
    };

    $scope.updateDescription = function() {
      //console.log('updating dataset description');
      if (!$scope.dataset.id) {
        //console.log('Dataset not yet saved');
      } else {
        if ($scope.datasetUpdate.description === $scope.dataset.description) {
          //console.log('Dataset saved, but no description change');
        } else {
          var dataset = {
            id         : $scope.dataset.id,
            description : $scope.datasetUpdate.description
          };
          DatasetSrv.update({id:dataset.id},dataset,function(res){
            if (res.id){
              $scope.datasetUpdate.description = res.description;
              toaster.pop('success', null, 'Dataset description updated.');
            } else {
              //console.log('error updating description', res);
            }
          });
        }
      }
    };

    $scope.update = function(){

      var dataset = {
        id: $scope.dataset.id,
        title: $scope.dataset.title,
        description: $scope.dataset.description
      };

      DatasetSrv.update({id: dataset.id}, dataset,function(res){
        if (res.id){
          $scope.dataset = res;
          toaster.pop('success', null, 'Dataset updated.');
        }
      });
    };

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



    /*** Distribution functions */
    $scope.initNewDistribution = function (){
      //console.log('Starting new distribution');
      $scope.newDistribution = {};
      ngDialog.open({
        template: 'app/routes/dataset/partials/addDistributionModal.html',
        className: 'ngdialog-theme-default fullscreenDialog',
        scope: $scope
      });
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
              if (res.status === 'success'){
                $scope.dataset.distributions.push(res.distribution);
                toaster.pop('success', 'Updated', 'New dataset added.');
                ngDialog.closeAll();
                $scope.newDistribution = null;
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

    $scope.deleteDistribution = function(index){
      var id = $scope.dataset.id;
      var distributionId = $scope.dataset.distributions[ index].id;

      DatasetDistributionSrv.delete({id:id, distributionId:distributionId}, function(res){
        if (res.status === 'success') {
          $scope.dataset.distributions.splice(index,1);
          toaster.pop('success', 'Done', 'Distribution deleted.');
        }
      });
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


    /*** Reference functions */
    $scope.newReference = function() {

      ngDialog.open({
        template: 'app/routes/dataset/partials/addReferenceModal.html',
        className: 'ngdialog-theme-default fullscreenDialog',
        scope: $scope
      });
    };

    $scope.checkReferenceLink = function(link){

      $scope.reference = {
        link   : link,
        valid  : false,
        error  : null,
        result : null
      };

      $scope.reference.checkingLink = true;

      EmbedlySrv.extract($scope.reference.link)
        .then(function(result){
          console.log(result);
          $scope.reference.result = result;
          $scope.reference.valid = true;
          $scope.reference.checkingLink = false;
        }, function(err){
          $scope.reference.error = err;
          $scope.reference.valid = null;
          $scope.reference.checkingLink = false;
      });
    };

    $scope.saveReference = function() {

      // construct the reference
      var reference = {
        description      : $scope.reference.result.description,
        url              : $scope.reference.result.url,
        title            : $scope.reference.result.title,
        provider_name    : $scope.reference.result.provider_name,
        provider_display : $scope.reference.result.provider_dis
      };

      if ($scope.reference.result.images[0]){
        reference.image = $scope.reference.result.images[0].url;
      }

      console.log('saving reference', reference);

      // save reference
      DatasetReferencesSrv.save({id:$scope.dataset.id, reference: reference}, function(res){
        if (res.status==='success') {
          $scope.dataset.references.push(reference);
          ngDialog.closeAll();
        } else {
          $scope.reference.error = 'Something went wrong.';
        }
      });
    };

    $scope.deleteReference = function(index){
      console.log(index);
      var id = $scope.dataset.id;
      var referenceId = $scope.dataset.references[ index].id;

      DatasetReferencesSrv.delete({id:id, referenceId:referenceId}, function(res){
        console.log(res);
        if (res.status === 'success') {
          $scope.dataset.references.splice(index,1);
        }
      });

    };


    $scope.togglePrivate = function(status){
      if (status !== $scope.dataset.private) {
        $scope.visibilityStatusMessage = 'updating';
        console.log('setting private to', status);
        var dataset = {
          id: $scope.dataset.id,
          private: status
        };
        DatasetSrv.update({id: dataset.id}, dataset, function(res){
          $scope.visibilityStatusMessage = 'updated';
          if (res.id){
            $scope.dataset.visibilityStatus = status;
            toaster.pop('success', null, 'Dataset visibility status updated to  ' + status);
          }
        });
      }
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
