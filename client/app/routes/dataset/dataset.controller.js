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
        if (!dataset._id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.contentLoading = false;
        $scope.dataset = dataset;
        $window.document.title = 'columby.com | ' + dataset.title;

        // transition the url from slug to id
        if ($stateParams.id !== dataset._id) {
          $state.transitionTo ('dataset.view', { id: dataset._id}, {
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

        $scope.dataset.canEdit= AuthSrv.canEdit({postType:'dataset', _id:dataset.account._id});

        updateHeaderImage();

      });
    }

    function updateHeaderImage(){
      $scope.headerStyle={
        'background-image': 'url(/assets/images/default-header-bw.svg), url(' + $scope.dataset.headerImage + ')',
        'background-blend-mode': 'multiply'
      };
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
  .controller('DatasetEditCtrl', function($window, $rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DatasetDistributionSrv, DatasetReferencesSrv, AuthSrv, toaster, Slug, ngDialog,EmbedlySrv, $http, $upload) {

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
        if (!dataset._id){
          toaster.pop('danger',null,'Sorry, the requested dataset was not found. ');
          $state.go('home');
          return;
        }
        // add acquired dataset to the scope
        $scope.contentLoading = false;
        $scope.dataset = dataset;
        $window.document.title = 'columby.com | ' + dataset.title;

        // set the avatar
        if (!dataset.account.avatar) {
          dataset.account.avatar = $rootScope.user.accounts[ $rootScope.selectedAccount].avatar.url;
        }

        // transition the url from slug to id
        if ($stateParams.id !== dataset._id) {
          $state.transitionTo ('dataset.view', { id: dataset._id}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // set draft title and description
        $scope.datasetUpdate.title = $scope.dataset.title;
        $scope.datasetUpdate.description = $scope.dataset.description;

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

        $scope.dataset.canEdit= AuthSrv.canEdit({postType:'dataset', _id:dataset.account._id});

        updateHeaderImage();

      });
    }

    function initiateNewDataset(){
      $scope.dataset = {
        title             : null,
        description       : null,
        avatar :{
          url               : 'assets/images/avatar.png'
        },
        draft:{},
        account: $rootScope.user.accounts[ $rootScope.selectedAccount]._id,
        canEdit : true
      };

      toaster.pop('notice',null,'Here\'s your new dataset!');
    }

    function updateHeaderImage(){
      $scope.headerStyle={
        'background-image': 'url(/assets/images/default-header-bw.svg), url(' + $scope.dataset.headerImage + ')',
        'background-blend-mode': 'multiply'
      };
    }

    /***   SCOPE FUNCTIONS   ***/
    $scope.toggleOptions = function(){
      $scope.showOptions = !$scope.showOptions;
    };

    /* dataset functions */
    $scope.updateTitle = function() {
      if (!$scope.dataset._id) {
        //console.log('Title changed, but not yet saved');
      } else {
        if ($scope.datasetUpdate.title === $scope.dataset.title) {
          //console.log('Dataset saved, but no title change');
        } else {
          var dataset = {
            _id: $scope.dataset._id,
            title: $scope.datasetUpdate.title,
          };
          //console.log('updating dataset title', dataset);

          DatasetSrv.update({id:dataset._id},dataset,function(res){
            if (res._id){
              $scope.datasetUpdate.title = res.title;
              toaster.pop('success', null, 'Dataset title updated.');
            }
          });
        }
      }
    };

    $scope.updateDescription = function() {
      //console.log('updating dataset description');
      if (!$scope.dataset._id) {
        //console.log('Dataset not yet saved');
      } else {
        if ($scope.datasetUpdate.description === $scope.dataset.description) {
          //console.log('Dataset saved, but no description change');
        } else {
          var dataset = {
            _id         : $scope.dataset._id,
            description : $scope.datasetUpdate.description
          };
          DatasetSrv.update({id:dataset._id},dataset,function(res){
            if (res._id){
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
        _id: $scope.dataset._id,
        title: $scope.dataset.title,
        description: $scope.dataset.description
      };

      DatasetSrv.update({id: dataset._id}, dataset,function(res){
        if (res._id){
          $scope.dataset = res;
          toaster.pop('success', null, 'Dataset updated.');
        }
      });
    };

    $scope.create = function() {
      $scope.dataset.title = $scope.datasetUpdate.title;
      $scope.dataset.description = $scope.datasetUpdate.description;
      DatasetSrv.save($scope.dataset, function(res){
        //console.log('create',res);
        if (res._id) {
          toaster.pop('success', null, 'Your dataset page is created. Now add some data.');
          $state.go('dataset.edit', {id:res._id, editMode:true});
        }
      });
    };

    $scope.updateSlug = function(){
      var slug = Slug.slugify($scope.dataset.slug);
      var d={
        _id: $scope.dataset._id,
        slug: slug
      };
      DatasetSrv.update({id: d._id}, d, function(res){
        //console.log(res);
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
            uploader          : $rootScope.user._id,
            distributionType  : $scope.newDistribution.distributionType,
            publicationStatus : 'public',
            // DCAT stuff
            accessUrl         : $scope.newDistribution.link
          };
          //console.log('attaching distribution', distribution);

          DatasetDistributionSrv.save({
            id:$scope.dataset._id,
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
      var id = $scope.dataset._id;
      var distributionId = $scope.dataset.distributions[ index]._id;

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
          accountId: $scope.dataset.account._id
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
                  fileId: fileResponse._id,
                  url: parsedData.location
                }
              })
              .success(function(response){
                //console.log('res', response);
                $scope.dataset.headerImage = response.url;
                var d = {
                  id: $scope.dataset._id,
                  headerImage: response.url
                };
                //console.log('datasetUpdate', d);
                DatasetSrv.update(d, function(result){
                  //console.log('r',result);
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
      DatasetReferencesSrv.save({id:$scope.dataset._id, reference: reference}, function(res){
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
      var id = $scope.dataset._id;
      var referenceId = $scope.dataset.references[ index]._id;

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
          _id: $scope.dataset._id,
          private: status
        };
        DatasetSrv.update({id: dataset._id}, dataset, function(res){
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
    if ($stateParams.id) {
      getDataset();
    } else {
      initiateNewDataset();
    }
  }
);
