(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('FileManagerModalCtrl', function(options, $rootScope, $scope, $modal, $modalInstance, FileSrv, Upload, ngNotify){
    //$log.debug('options', options);
    $scope.file = [];
    $scope.options = options;
    $scope.pagination = {
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 20,
      maxSize: 5
    };

    $scope.upload = { valid:false };
    $scope.progress=0;
    // Fetch first file assets

    getFiles();

    function getFiles(){
      $scope.options.limit = $scope.pagination.itemsPerPage;
      $scope.options.offset = ($scope.pagination.currentPage -1) * $scope.pagination.itemsPerPage;

      FileSrv.query($scope.options).then(function(result){
        $scope.files = result;
        $scope.pagination.totalItems = result.count;
      });
    }

    $scope.pageChanged = function() {
      //$log.debug('Page changed to: ' + $scope.pagination.currentPage);
      getFiles();
    };


    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };


    $scope.showUploader = function(){
      $scope.uploaderOpen = true;
    };


    $scope.closeUploader = function() {
      $scope.uploaderOpen = false;
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
            account_id: options.account_id,
            filename: file.name,
            filetype: file.type,
            filesize: file.size
          }).then(function(result){
            //$log.debug(result);
            // $log.debug(result.credentials.fields);
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
              }).success(function (data, status, headers, config) {
                $scope.progress=0;
                // $log.debug('file ' + config.file.name + 'uploaded. Response: ' + data);
                FileSrv.finishUpload({id: result.file.id}).then(function(){
                  ngNotify.set('File uploaded!');
                  $scope.files.rows.unshift(result.file);
                }).catch(function(error){
                  ngNotify.set('Error: ' + error, 'error');
                  // $log.debug('error: ', error)
                });
              }).error(function (data, status, headers, config) {
                // $log.debug(data, headers);
                $scope.progress=0;
                // $log.debug('error status: ' + status);
              });
            }
          });
        }
      }
    };


    // Handle the selection of a file
    $scope.select = function(asset){
      $modalInstance.close(asset);
    };


    // Delete a file from db and file-storage
    $scope.delete = function(index, file){
      // $log.debug('index', index);
      // $log.debug(file);
      $modal.open({
        size:'lg',
        template: '<div class="row"><div class="col-md-offset-1 col-md-10"><h3>Do you really want to delete the image?</h3><br><br><br><a href ng-click="$dismiss()">cancel</a><button class="btn btn-default btn-danger pull-right" ng-click="$close()">DELETE</button></div><br></div>'
      }).result.then(function(){
        FileSrv.destroy(file.id).then(function(){
          // $log.debug(result);
          $scope.files.rows.splice(index,1);
          $scope.pagination.totalItems = $scope.files.rows.splice(index,1);
        });
      });
    };
  });
})();
