'use strict';

angular.module('columbyApp')

/**
 *
 * The file manager is activated by a $broadcast event 'openFileManager'
 *
 **/
.controller('FileManagerCtrl', function($rootScope, $scope, $modal){

  function open(options){
    if (!$rootScope.user || !$rootScope.user.id){
      console.log('Not logged in');
    } else {
      console.log('options', options);
      // Open modal
      $scope.modalInstance = $modal.open({
        templateUrl: 'app/directives/fileManager/views/fileManager.html',
        controller: 'FileManagerModalCtrl',
        size: 'lg',
        windowClass: 'filebrowser-modal',
        resolve: {
          options: function(){
            return options;
          }
        }
      }).result.then(function(file){
        console.log('Sending browser selected. ');
        $rootScope.$broadcast('fileManagerSelected', {file:file, action: options.action});
      }, function(){
        $rootScope.$broadcast('fileManagerClose');
      });
    }
  }

  // Handle show file browser event
  $scope.$on('openFileManager', function(event, options){
    open(options);
  });
})
