'use strict';

angular.module('mean.datasets').controller('DatasetsController', ['$scope', '$state', 'Global', 'DatasetSrv',
  function($scope, $state, Global, DatasetSrv) {
    $scope.global = Global;
    $scope.package = {
      name: 'datasets'
    };
  }
]);


angular.module('mean.datasets')

.controller('DatasetViewCtrl', [
  '$rootScope', '$scope', '$location', '$state', '$stateParams', 'DatasetSrv', 'DatasetDistributionSrv', 'DatasetReferencesSrv', 'MetabarSrv', 'AuthSrv', 'toaster', 'Slug', 'ngDialog','EmbedlySrv',
  function($rootScope, $scope, $location, $state, $stateParams, DatasetSrv, DatasetDistributionSrv, DatasetReferencesSrv, MetabarSrv, AuthSrv, toaster, Slug, ngDialog,EmbedlySrv) {

    /***   INITIALISATION   ***/
    //var editWatcher;               // Watch for model changes in editmode

    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode

    // check edit mode
    if ($location.path().split('/')[3] === 'edit') {
      $scope.editMode = true;
    }

    /***   FUNCTIONS   ***/
    function getDataset(){
      $scope.contentLoading = true;  // show loading message while loading dataset
      DatasetSrv.get({
        datasetId: $stateParams.datasetId
      }, function(dataset) {

        // set the avatar
        if (!dataset.account.avatar) {
          dataset.account.avatar = $rootScope.selectedAccount.avatar.url;
        }
        console.log('dataset', dataset);

        // add acquired dataset to the scope
        $scope.dataset = dataset;

        // transition the url from slug to id
        if ($stateParams.datasetId !== dataset._id) {
          $state.transitionTo ('dataset.view', { datasetId: dataset._id}, {
            location: true,
            inherit: true,
            relative: $state.$current,
            notify: false
          });
        }

        // remove editmode
        // console.log($stateParams);
        // if ($stateParams.datasetId && $stateParams.editMode === 'true') {
        //   $state.transitionTo ('dataset.view', { datasetId: dataset._id}, {
        //     location: true,
        //     inherit: false,
        //     relative: $state.$current,
        //     notify: false
        //   });
        // }

        $scope.contentLoading = false;

        if ($scope.editMode){
          // set draft title and description
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
        if ($rootScope.selectedAccount && (dataset.account._id === $rootScope.selectedAccount._id)){
          $scope.dataset.canEdit = true;
        }

        $scope.dataset.descriptionUpdate = $scope.dataset.description;
      });
    }

    function initiateNewDataset(){
      $scope.dataset = {
        title             : 'New title',
        description       : '<p>Add a nice description for your publication. </p>',
        visibilityStatus  : 'private',
        avatar :{
          url               : 'columby/assets/img/avatar.png'
        },
        draft:{},
        account: $rootScope.selectedAccount._id
      };
    }

    function toggleEditMode(mode){
      if (!mode){
        $scope.editMode = !$scope.editMode;
      } else if (mode===true) {
        $scope.editMode = mode;
        // watch title change
        $scope.$watch('dataset.title', function(newVal, oldVal) {
          console.log('n ' + newVal + ' - old ' + oldVal);
          if (newVal !== oldVal){
            var dataset = {
              _id: $scope.dataset._id,
              title: newVal
            };

            DatasetSrv.update({datasetId: dataset._id}, dataset,function(res){
              if (res._id){
                toaster.pop('success', 'Updated', 'Dataset title updated.');
              }
            });
          }
        });

      } else if (mode===false) {
        $scope.editMode = mode;
        // turn watching off.
        //editWatcher();
        $rootScope.$broadcast('editMode::false');
      }
    }


    /***   SCOPE FUNCTIONS   ***/

    /*** Editmode functions */
    $scope.enterEditmode = function(){
      //toggleEditMode(true);
      $state.go('dataset.edit', {datasetId: $scope.dataset._id});
    };
    $scope.exitEditmode = function(){
      //toggleEditMode(false);
      $state.go('dataset.view', {datasetId: $scope.dataset._id});
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
      if ($scope.dataset.descriptionUpdate !== $scope.dataset.description) {
        var dataset = {
          _id: $scope.dataset._id,
          description: $scope.dataset.descriptionUpdate
        };

        DatasetSrv.update({datasetId:dataset._id},dataset,function(res){
          if (res._id){
            $scope.dataset.descriptionUpdate = res.description;
            toaster.pop('success', 'Updated', 'Dataset description updated.');
          }
        });
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
              console.log(res);
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
            toaster.pop('success', 'Updated', 'Dataset visibility status updated to  ' + status);
          }
        });
      }
    };


    /* --------- ROOTSCOPE EVENTS ------------------------------------------------------------ */


    /* --------- INIT ------------------------------------------------------------------------ */
    if ($stateParams.datasetId) {
      console.log('fetch dataset');
      getDataset();
    } else {
      initiateNewDataset();
      toggleEditMode(true);
    }
  }
]);
