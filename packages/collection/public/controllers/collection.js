'use strict';

angular.module('mean.collection').controller('CollectionViewCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'CollectionSrv', 'MetabarSrv', 'AuthSrv', 'toaster',
  function($rootScope, $scope, $state, $stateParams, CollectionSrv, MetabarSrv, AuthSrv, toaster) {

    /***   INITIALISATION   ***/
    var editWatcher;               // Watch for model changes in editmode

    $scope.editMode = false;       // edit mode is on or off
    $scope.contentEdited = false;  // models is changed or not during editmode
    $scope.collectionId  = $stateParams.id;

    if ($state.current.data && $state.current.data.editMode) {
      $scope.editMode = true;
    }

    /***   FUNCTIONS   ***/
    function getCollection(){
      $scope.contentLoading = true;  // show loading message while loading collection

      CollectionSrv.get({ id: $scope.collectionId }, function(collection) {
        $scope.collection = collection;
        $scope.contentLoading = false;
        // send metadata to the metabar
        var meta = {
          postType: 'collection',
          _id: collection._id,
          publisher: collection.publisher,
          created: collection.created,
          updated: collection.updated,
        };
        meta.canEdit = AuthSrv.canEdit(meta);
        MetabarSrv.setPostMeta(meta);
      });
    }

    function getAccount(){

      return $scope.accountId;
    }

    function initiateNewCollection(){
      $scope.collection = {
        title: 'New collection',
        description: 'Description of the collection',
        account: $scope.accountId
      };
      console.log('collection initiated', $scope.collection);
    }


    /***   SCOPE FUNCTIONS   ***/
    $scope.toggleEditMode = function(){

      $scope.editMode = !$scope.editMode;
      // send closed message to metabar
      if ($scope.editMode === false) {
        $rootScope.$broadcast('editMode::false');
      }
    };

    $scope.update = function(){

      var collection = {
        _id: $scope.collection._id,
        title: $scope.collection.title,
        description: $scope.collection.description
      };

      CollectionSrv.update(collection,function(res){
        if (res._id){
          $scope.collection = res;
          toaster.pop('success', 'Updated', 'Collection updated.');
          $scope.toggleEditMode();
        }
      });
    };

    $scope.create = function(){
      CollectionSrv.save($scope.collection, function(res){
        console.log('Collection result', res);
        if (res._id) {
          console.log('Collection result', res);
          toaster.pop('success', 'Created', 'Collection created.');
          $state.go('collection.view', {id: res._id});
        }
      });
    };

    /*** ROOTSCOPE EVENTS ***/
    // Turn on or off editMode for a collection
    $scope.$on('metabar::editMode', function(evt,mode){
      $scope.editMode = mode;

      if (mode === true){
        // turn edit mode on
        editWatcher = $scope.$watchCollection('collection', function (newval, oldval) {
          if (!angular.equals(oldval, newval)) {
            $scope.contentEdited = true;
          }
        });
      } else {
        // turn watching off.
        editWatcher();
      }
    });



    /*** INIT ***/
    if (!$scope.editMode) {
      // Fetch the desired collection
      getCollection();
    } else {
      // Get the desired publication account
      if ($scope.accountId) { getAccount(); }
      // Create a new base collection
      initiateNewCollection();
      // make sure edit mode is turned on
      $rootScope.$broadcast('metabar::editMode', true);
    }
  }
]);
