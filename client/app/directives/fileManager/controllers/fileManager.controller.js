'use strict';

angular.module('columbyApp')

.controller('FileManagerCtrl', function($rootScope, $scope, $modal){
  console.log('filemanager');

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
      }).result.then(function(asset){
        console.log('Sending browser selected. ');
        $rootScope.$broadcast('fileManagerSelected', asset);
      }, function(){
        $rootScope.$broadcast('fileManagerClose');
      });
    }
  }

  // $scope.open = function(options){
  //   console.log('open file manager');
  //   //$rootScope.$broadcast('openFileManager', options);
  //   open(options);
  // }

  // Handle show file browser event
  $scope.$on('openFileManager', function(event, options){
    open(options);
  });
})
