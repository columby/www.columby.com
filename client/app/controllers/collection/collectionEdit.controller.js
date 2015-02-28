'use strict';

angular.module('columbyApp')

  .controller('CollectionEditCtrl', function ($rootScope, $scope, $state, $stateParams, AuthSrv, CollectionSrv, toaster) {

    // Configuration
    $scope.contentLoading = true;

    // FUNCTIONS
    function init(){
      // Get collection
      CollectionSrv.show({id:$stateParams.id }, function(result){
        if (AuthSrv.canEdit('collection', result)){
          $scope.collection = result;
          $scope.collection.Account.avatar.url = $rootScope.config.filesRoot + '/a/' + $scope.collection.Account.avatar.shortid + '/' + $scope.collection.Account.avatar.filename;
          // set draft title and description
          $scope.collectionUpdate = {
            title: $scope.collection.title,
            description: $scope.collection.description
          };
        } else {
          $state.go('collection({id: result.shortid}');
        }
      });
    }


    // SCOPE FUNCTIONS
    $scope.update = function(){
      var changed = false;
      var collection = {
        id: $scope.collection.id,
        title: $scope.collection.title,
        description: $scope.collection.description
      };

      if (collection.title !== $scope.collectionUpdate.title) {
        collection.title = $scope.collectionUpdate.title;
        changed = true;
      }
      if (collection.description !== $scope.collectionUpdate.description){
        collection.description = $scope.collectionUpdate.description;
        changed = true;
      }
      if (changed){
        CollectionSrv.update({id: collection.id}, collection, function(result){
          if (result.id){
            $scope.collection.title = result.title;
            $scope.collection.description = result.description;
            $scope.collectionUpdate.title = result.title;
            $scope.collectionUpdate.description = result.description;
            toaster.pop('success', null, 'Collection updated.');
          } else {
            toaster.pop('warning', null, 'There was an error updating the collection.');
          }
        });
      }
    };


    $scope.delete = function(){
      console.log('delete collection');
      CollectionSrv.delete({id: $scope.collection.id}, function(res){
        if (res){
          toaster.pop('success', null, 'Collection deleted.');
          $state.go('accountEdit', {slug: $scope.collection.Account.slug});
        } else {
          toaster.pop('warning', null, 'There was an error deleting the collection.');
        }
      });
    };



    // START
    init();

  })

;
