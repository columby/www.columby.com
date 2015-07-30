'use strict';

angular.module('columbyApp')

/**
 *
 *  Controller for a dataset Edit options page
 *
 */
.controller('DatasetTagsCtrl', function(dataset, $modalInstance, $rootScope, $scope, DatasetSrv, Slug) {
  $scope.dataset = dataset;

  $scope.addTag = function(tag){
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


  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')     // Replace multiple - with single -
      .replace(/^-+/, '')         // Trim - from start of text
      .replace(/-+$/, '');        // Trim - from end of text
                                  // Limit characters
  }

  $scope.slugifyTag = function(){

    $scope.newTag.text = Slug.slugify($scope.newTag.text);
    // $scope.newTag.text = $scope.newTag.text.toString().toLowerCase()
    //   .replace(/\s+/g, '-')       // Replace spaces with -
    //   .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    //   .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    //   .replace(/^-+/, '')         // Trim - from start of text
    //   .replace(/-+$/, '');        // Trim - from end of text
    //                               // Limit characters
  };


  $scope.removeTag = function(tag){
    console.log('removing tag, ', tag);
    var id = $scope.dataset.tags.indexOf(tag);
    console.log(tag);
    DatasetSrv.removeTag({id:$scope.dataset.id, tid:tag.id},function(result){
      console.log('dataset remove result: ', result);
      $scope.dataset.tags.splice(id,1);
    });
  };


});
