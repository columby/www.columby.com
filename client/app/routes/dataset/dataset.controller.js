'use strict';

angular.module('columbyApp')

  .controller('DatasetViewCtrl', [
  'configuration', '$rootScope', '$scope', '$location', '$state', '$stateParams', 'DatasetSrv', 'DatasetDistributionSrv', 'DatasetReferencesSrv', 'MetabarSrv', 'AuthSrv', 'toaster', 'Slug', 'ngDialog','EmbedlySrv','$http', '$upload',
  function(configuration, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DatasetDistributionSrv, DatasetReferencesSrv, MetabarSrv, AuthSrv, toaster, Slug, ngDialog,EmbedlySrv, $http, $upload) {

    /***   INITIALISATION   ***/
    //var editWatcher;               // Watch for model changes in editmode

    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode
    $scope.hostname = $location.protocol() + '://' + $location.host();

    // check edit mode
    if ($location.path().split('/')[3] === 'edit') {
      $scope.editMode = true;
      $scope.showOptions = false;
    }

    /***   FUNCTIONS   ***/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset
      DatasetSrv.get({
        datasetId: $stateParams.datasetId
      }, function(dataset) {

        if (!dataset._id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.contentLoading = false;
        $scope.dataset = dataset;

        // set the avatar
        if (!dataset.account.avatar) {
          dataset.account.avatar = $rootScope.selectedAccount.avatar.url;
        }

        // transition the url from slug to id
        if ($stateParams.datasetId !== dataset._id) {
          $state.transitionTo ('dataset.view', { datasetId: dataset._id}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // set draft title and description
        if ($scope.editMode){
          $scope.dataset.titleUpdate = $scope.dataset.title;
          $scope.dataset.descriptionUpdate = $scope.dataset.description;
        }

        // create summary
        var summary = '<p>';
        // check for file source
        if (!dataset.sources) {
          summary += 'There is no data for this dataset available yet. ';
        } else if (!dataset.sources.primary) {
          summary += 'There is no primary source for this dataset yet. ';
        } else if (dataset.sources.primary.type) {
          summary += 'This dataset if of the type <strong>' + dataset.sources.primary.type + '</strong>.';
        }
        $scope.summary = summary + '</p>';

        $scope.dataset.canEdit = false;
        if (dataset.account._id === $rootScope.user.accounts[ $rootScope.user.selectedAccount]._id) {
          $scope.dataset.canEdit = true;
        }

        updateHeaderImage();

      });
    }

    function initiateNewDataset(){
      $scope.dataset = {
        title             : '',
        description       : '<p>Add a nice description for your publication. </p>',
        visibilityStatus  : 'private',
        avatar :{
          url               : 'columby/assets/img/avatar.png'
        },
        draft:{},
        account: $rootScope.user.accounts[ $rootScope.user.selectedAccount]._id,
        canEdit : true
      };
      toaster.pop('notice',null,'Here\'s your new dataset!');
    }

    function toggleEditMode(mode){
      $scope.editMode = mode || !$scope.editMode;
      if ($scope.editMode) {
        $scope.dataset.titleUpdate = $scope.dataset.title;
        $scope.dataset.descriptionUpdate = $scope.dataset.description;
      }
    }


    function updateHeaderImage(){
      $scope.headerStyle={
        'background-image': 'url(/columby/assets/img/bg.png), url(' + $scope.dataset.headerImage + ')',
        'background-blend-mode': 'multiply'
      };
    }

    /***   SCOPE FUNCTIONS   ***/

    /*** Editmode functions */
    $scope.toggleEditmode = function(){
      if ($scope.editMode) {
        $state.go('dataset.view', {datasetId: $scope.dataset._id});
      } else {
        $state.go('dataset.edit', {datasetId: $scope.dataset._id});
      }
    };

    $scope.toggleOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    };

    /* dataset functions */
    $scope.updateTitle = function() {
      if (!$scope.dataset._id) {
        console.log('Title changed, but not yet saved');
      } else {
        if ($scope.dataset.titleUpdate === $scope.dataset.title) {
          console.log('Dataset saved, but no title change');
        } else {
          var dataset = {
            _id: $scope.dataset._id,
            title: $scope.dataset.titleUpdate,
          };
          console.log('updating dataset title', dataset);

          DatasetSrv.update({datasetId:dataset._id},dataset,function(res){
            if (res._id){
              $scope.dataset.titleUpdate = res.title;
              toaster.pop('success', 'Updated', 'Dataset title updated.');
            }
          });
        }
      }
    };

    $scope.updateDescription = function() {
      console.log('updating dataset description');
      if (!$scope.dataset._id) {
        console.log('Dataset not yet saved');
      } else {
        if ($scope.dataset.descriptionUpdate === $scope.dataset.description) {
          console.log('Dataset saved, but no description change');
        } else {
          var dataset = {
            _id         : $scope.dataset._id,
            description : $scope.dataset.descriptionUpdate
          };
          DatasetSrv.update({datasetId:dataset._id},dataset,function(res){
            if (res._id){
              $scope.dataset.descriptionUpdate = res.description;
              toaster.pop('success', 'Updated', 'Dataset description updated.');
            } else {
              console.log('error updating description', res);
            }
          });
        }
      }
    };

    $scope.update = function(){

      var dataset = {
        _id: $scope.dataset._id,
        title: $scope.dataset.title,
        description: $scope.dataset.description
      };

      DatasetSrv.update({datasetId: dataset._id}, dataset,function(res){
        if (res._id){
          $scope.dataset = res;
          toaster.pop('success', 'Updated', 'Dataset updated.');
          toggleEditMode();
        }
      });
    };

    $scope.create = function() {
      $scope.dataset.title = $scope.dataset.titleUpdate;
      $scope.dataset.description = $scope.dataset.descriptionUpdate;
      DatasetSrv.save($scope.dataset, function(res){
        console.log('create',res);
        if (res._id) {
          toaster.pop('success', 'Created', 'Dataset created.');
          $state.go('dataset.edit', {datasetId:res._id, editMode:true});
        }
      });
    };

    // Change publication from draft to published
    $scope.publishDataset = function(){
      if ($scope.dataset.publicationStatus !== 'published') {
        var dataset = {
          _id: $scope.dataset._id,
          publicationStatus: 'published',
          publishedAt: Date.now()
        };
        console.log('publishing dataset: ', dataset);
        DatasetSrv.update({datasetId: dataset._id}, dataset,function(res){
          console.log(res);
          if (res._id){
            $scope.dataset.publicationStatus = 'published';
            toaster.pop('success', 'Updated', 'Your dataset is now published! ');
          }
        });
      }
    };

    $scope.updateSlug = function(){
      var slug = Slug.slugify($scope.dataset.slug);
      var d={
        _id: $scope.dataset._id,
        slug: slug
      };
      DatasetSrv.update({datasetId: d._id}, d, function(res){
        console.log(res);
        if (res._id) {
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
      console.log('Starting new distribution');
      $scope.newDistribution = {};
      ngDialog.open({
        template: 'datasets/views/includes/addDistributionModal.html',
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
      console.log('Creating ditribution');
      // validate link
      if ($scope.newDistribution){
        if ($scope.newDistribution.valid) {
          // add link to model
          if (!$scope.dataset.hasOwnProperty('distributions')) {
            $scope.dataset.distributions = [];
          }

          var distribution = {
            // Columby Stuff
            uploader          : $rootScope.user._id,
            distributionType  : $scope.newDistribution.distributionType,
            publicationStatus : 'public',
            // DCAT stuff
            accessUrl         : $scope.newDistribution.link
          };
          console.log('attaching distribution', distribution);

          DatasetDistributionSrv.save({
            datasetId:$scope.dataset._id,
            distribution: distribution}, function(res){
              console.log('res', res);
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
      var datasetId = $scope.dataset._id;
      var distributionId = $scope.dataset.distributions[ index]._id;

      DatasetDistributionSrv.delete({datasetId:datasetId, distributionId:distributionId}, function(res){
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
      console.log('file', file);

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
          accountId: $scope.dataset.account._id
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
              'key' : $scope.dataset.account._id + '/' + response.file.filename,
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
                $scope.dataset.headerImage = response.url;
                var d = {
                  datasetId: $scope.dataset._id,
                  headerImage: response.url
                };
                console.log('datasetUpdate', d);
                DatasetSrv.update(d, function(result){
                  console.log('r',result);
                  if (result._id) {
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
                alert('Upload Failed');
            }
          }, function(e){
            console.log(e);
          }, function(evt) {
            console.log(evt);
            file.progress =  parseInt(100.0 * evt.loaded / evt.total);
          });
        })
        .error(function(data, status, headers, config){
          console.log('Error message', data.err);
          console.log(status);
        });
    };


    /*** Reference functions */
    $scope.newReference = function() {

      ngDialog.open({
        template: 'datasets/views/includes/addReferenceModal.html',
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
      DatasetReferencesSrv.save({datasetId:$scope.dataset._id, reference: reference}, function(res){
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
      var datasetId = $scope.dataset._id;
      var referenceId = $scope.dataset.references[ index]._id;

      DatasetReferencesSrv.delete({datasetId:datasetId, referenceId:referenceId}, function(res){
        console.log(res);
        if (res.status === 'success') {
          $scope.dataset.references.splice(index,1);
        }
      });

    };


    $scope.toggleVisibilityStatus = function(status){
      if (status !== $scope.dataset.visibilityStatus) {
        $scope.visibilityStatusMessage = 'updating';
        var dataset = {
          _id: $scope.dataset._id,
          visibilityStatus: status
        };
        DatasetSrv.update({datasetId: dataset._id}, dataset,function(res){
          $scope.visibilityStatusMessage = 'updated';
          if (res._id){
            $scope.dataset.visibilityStatus = status;
            toaster.pop('success', null, 'Dataset visibility status updated to  ' + status);
          }
        });
      }
    };


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.datasetId) {
      getDataset();
    } else {
      initiateNewDataset();
      toggleEditMode(true);
    }
  }
]);
