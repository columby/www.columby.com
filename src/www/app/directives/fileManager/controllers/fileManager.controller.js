(function() {
  'use strict';

  angular
    .module('columbyApp')
    /**
     *
     * The file manager is activated by a $broadcast event 'fm-open'
     *
     **/
    .controller('FileManagerCtrl', function($window, $log,$rootScope, $scope, FileSrv, AuthSrv, $modal, ngNotify, Upload){

      // Init settings
      $scope.file = [];
      $scope.pagination = {
        totalItems: 0,
        currentPage: 1,
        itemsPerPage: 20,
        maxSize: 5
      };
      $scope.upload = { valid:false };
      $scope.progress=0;

      // set file browser height based on window height
      function setBrowserHeight() {
        var h = $window.innerHeight -
                  60 - //angular.element('.fm-header').height() -
                  66 - //angular.element('.fm-controls').height() -
                  75; //angular.element('fm-pagination').height();
        angular.element('.fm-browser').css('height', h);
      }
      // Update browser css bases on screen size
      // Todo: Only when active?
      angular.element($window).bind('resize', function() {
        if ($scope.showFileManager) {
          setBrowserHeight();
        }
      });
      setBrowserHeight();

      // Get a list of files
      function getFiles(){
        $scope.options.limit = $scope.pagination.itemsPerPage;
        $scope.options.offset = ($scope.pagination.currentPage -1) * $scope.pagination.itemsPerPage;

        FileSrv.query($scope.options).then(function(result){
          $scope.files = result;
          $scope.pagination.totalItems = result.count;
        });
      }

      // Open the file manager
      function open(options) {
        if (AuthSrv.isAuthenticated()) {
          $scope.options = options;
          // Open modal
          $scope.showFileManager = true;
          angular.element('body').addClass('fm-open');
          angular.element('.fm').css('opacity', '1');

          // Fetch first file assets
          getFiles();
        }
      }

      // Close the file manager
      function close() {
        delete $scope.files;
        $scope.showFileManager = false;
        angular.element('body').removeClass('fm-open');
      }


      // Update files list
      $scope.pageChanged = function() {
        $log.debug('Page changed to: ' + $scope.pagination.currentPage);
        getFiles();
      };

      // Handle file selected
      $scope.select = function(file) {
        $log.debug('Sending browser selected. ');
        $rootScope.$broadcast('fm-selected', {file: file});
        close();
      };

      // Delete a file from db and file-storage
      $scope.delete = function(file){
        $modal.open({
          size:'lg',
          templateUrl: '/views/directives/fileManager/modals/delete.html'
        }).result.then(function(){
          FileSrv.destroy(file.id).then(function(){
            $scope.files.rows.splice( $scope.files.rows.indexOf(file), 1 );
            $scope.pagination.totalItems = $scope.files.rows.length;
          });
        });
      };

      // Close the file manager
      $scope.close = function() {
        close();
      };

      // Show uploadprogress
      $scope.showUploadProgress = function(){
        $scope.showUploadProgress = true;
      };

      // Hide uploadprogress
      $scope.hideUploadProgress = function() {
        delete $scope.showUploadProgress;
      };

      // Handle file upload select
      $scope.onUpload = function(files){
        if (files && files.length) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            // $log.debug(file);
            //$log.debug('o', options);
            FileSrv.sign({
              type: 'image',
              account_id: $scope.options.account_id,
              filename: file.name,
              filetype: file.type,
              filesize: file.size
            }).then(function(result){
              $log.debug(result);
              if (result.status==='error') {
                ngNotify.set('Error: ' + result.msg, 'error');
              } else {
                Upload.upload({
                  url: result.credentials.url,
                  fields: result.credentials.fields,
                  method: 'POST',
                  skipAuthorization: true,
                  file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // $log.debug('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    $scope.progress=progressPercentage;
                }).success(function() {
                  $scope.progress=0;
                  // $log.debug('file ' + config.file.name + 'uploaded. Response: ' + data);
                  FileSrv.finishUpload({id: result.file.id}).then(function(){
                    ngNotify.set('File uploaded!');
                    $scope.files.rows.unshift(result.file);
                  }).catch(function(error){
                    ngNotify.set('Error: ' + error, 'error');
                    // $log.debug('error: ', error)
                  });
                }).error(function () {
                  // $log.debug(data, headers);
                  $scope.progress=0;
                  // $log.debug('error status: ' + status);
                });
              }
            });
          }
        }
      };

      // Handle show file browser event
      $scope.$on('fm-open', function(event, options){
        $log.debug('Open filemanager. ');
        open(options);
      });
    });
  })();
