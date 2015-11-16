(function() {
  'use strict';

  angular.module('ng-app').controller('DatasetOptionsCtrl', function($log, dataset, account, $modalInstance, $rootScope, $scope, DatasetSrv,ngNotify,appConstants, $modal,$state,Slug,CategorySrv) {

      var modalOpened = false;

      // add account datasets that have not been added tot the account to the dataset
      var datasetRegistryIds = [];
      for (var i=0; i<dataset.registries.length;i++){
        datasetRegistryIds.push(dataset.registries[ i].id);
      }

      for (i=0; i<account.registries.length; i++){
        $log.debug('Account registry id: ' + account.registries[ i].id);
        if (datasetRegistryIds.indexOf(account.registries[ i].id) === -1) {
          $log.debug(account.registries[ i]);
          var dr = account.registries[ i];
          dr.dataset_registries = {
            status: false,
            registry_id: dr.id,
            dataset_id: dataset.id
          };
          dataset.registries.push(dr);
        } else {
          dataset.registries[ datasetRegistryIds.indexOf(account.registries[ i].id)].account_registries = account.registries[ i].account_registries;
        }
      }

      $scope.dataset = dataset;
      $scope.account = account;

      /**
       * Update the header background image
       */
      function updateHeaderImage(){
        if ($scope.dataset.headerImg) {
          $scope.dataset.headerImg.url = appConstants.filesRoot + '/a/' + $scope.dataset.headerImg.shortid + '/' + $scope.dataset.headerImg.filename;
          $scope.headerStyle = {
            'background-image': 'linear-gradient(transparent,transparent), url(/images/default-header-bw.svg), url(' + $scope.dataset.headerImg.url + ')',
            'background-blend-mode': 'multiply'
          };
        }
      }

      $scope.updateSlug = function(){
        var slug = Slug.slugify($scope.dataset.slug);
        var d={
          id: $scope.dataset.id,
          slug: slug
        };
        DatasetSrv.update({id: d.id}, d, function(res){
          //$log.debug(res);
          if (res.id) {
            $scope.dataset.slug = res.slug;
            ngNotify.set('Dataset custom URL updated.');
          } else if (res.err && res.err.errors.slug){
            ngNotify.set('There was an error setting the custom URL: ' + res.err.errors.slug.message);
          } else {
            ngNotify.set('There was an error updating the custom URL.');
          }
        });
      };


      // CATEGORIES
      $scope.activeCategory = function(category){
        var active = false;
        for (var i=0; i<$scope.dataset.categories.length; i++){
          if ($scope.dataset.categories[ i].id === category.id){
            active = true;
          }
        }
        return active;
      };

      $scope.toggleSelectedCategory = function(category){
        $log.debug($scope.activeCategory(category));
        if (!$scope.activeCategory(category)){
          //add
          DatasetSrv.addCategory({id: $scope.dataset.id}, {category: category}, function(result){
            $log.debug(result);
            $scope.dataset.categories.push(result);
            $log.debug($scope.dataset.categories);
          });
        } else {
          //remove
          DatasetSrv.removeCategory({id: $scope.dataset.id, cid: category.id}, function(result){
            $log.debug(result);
            for (var i=0;i<$scope.dataset.categories.length;i++){
              if ($scope.dataset.categories[ i].id === category.id){
                $scope.dataset.categories.splice(i,1);
              }
            }
          });
        }
      };


      /**
       *
       * Delete a Dataset
       *
       **/
      $scope.delete = function() {

        if (modalOpened) { return; }

        $scope.showOptions = !$scope.showOptions;

        modalOpened=true;

        $modal.open({
          templateUrl: 'views/dataset/confirm-delete.html',
          controller: 'DatasetDeleteCtrl',
          size: 'lg',
          backdrop: 'static',
          keyboard: false,
          resolve: {
            dataset: function () {
              return $scope.dataset;
            }
          }
        }).result.then(function(result) {
          $log.debug(result);
          if (result.status === 'error'){
            ngNotify.set('There was a problem deleting the dataset. (' + result.msg + ')', 'error');
          } else {
            $state.go('home');
            ngNotify.set('Dataset deleted.');
          }
          modalOpened=false;
        }, function() {
          modalOpened=false;
        });
      };


      // Dataset privacy
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
            ngNotify.set('Dataset visibility status updated to  ' + newStatus);
          } else {
            ngNotify.set('There was an error updating the setting.');
          }
        });
      };


      // REGISTRIES
      $scope.toggleDatasetRegistry = function($index, registry){
        var status = !registry.dataset_registries.status;
        DatasetSrv.updateRegistry({id: dataset.id, rid: registry.id},{ status:status }, function(result){
          $scope.dataset.registries[ $index].dataset_registries = result;
        });
      };


      // TAGS
      $scope.slugifyTag = function(){
        $scope.newTag.text = Slug.slugify($scope.newTag.text);
      };
      $scope.addTag = function(){
        DatasetSrv.addTag({
          id: $scope.dataset.id,
          tag: {text: $scope.newTag.text}
        }, function(result){
          if (result.added){
            $scope.dataset.tags.push(result.tag);
            $scope.newTag = null;
          } else {
            $scope.newTag = null;
          }
        });
      };
      $scope.removeTag = function(tag){
        $log.debug('removing tag, ', tag);
        var id = $scope.dataset.tags.indexOf(tag);
        $log.debug(tag);
        DatasetSrv.removeTag({id:$scope.dataset.id, tid:tag.id},function(result){
          $log.debug('dataset remove result: ', result);
          $scope.dataset.tags.splice(id,1);
        });
      };
    });
})();
