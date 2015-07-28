'use strict';

angular.module('columbyApp')

.controller('FileManagerModalCtrl', function(options, $rootScope, $scope, $modal, $modalInstance, FileSrv, Upload, ngNotify){

  $scope.options = options;

  $scope.file = [];

  $scope.upload = { valid:false };
  $scope.progress=0;
  // Fetch first file assets

  FileSrv.query({
    account_id: $rootScope.user.id
  }).then(function(result){
    $scope.files = result;
  });

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  }

  $scope.showUploader = function(){
    $scope.uploaderOpen = true;
  }
  $scope.closeUploader = function() {
    $scope.uploaderOpen = false;
  }

  $scope.onFileSelect = function(files){
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        console.log(file);

        FileSrv.sign({
          filename: file.name,
          filetype: file.type,
          filesize: file.size
        }).then(function(result){
          console.log(result);
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
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                $scope.progress=progressPercentage;
            }).success(function (data, status, headers, config) {
              $scope.progress=0;
              console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
              FileSrv.finishUpload({id: result.file.id}).then(function(status){
                ngNotify.set('File uploaded!');
                $scope.file.unshift(result.file);
              }).catch(function(error){
                ngNotify('Error: ' + result.msg, 'error');
                console.log('error: ', error)
              });
            }).error(function (data, status, headers, config) {
              console.log(data, headers);
              $scope.progress=0;
                console.log('error status: ' + status);
            });
          }
        });
      }
    }
  }

  $scope.validateUpload = function(){
    FileSrv.flickrGetInfo($scope.upload.provider_id).then(function(result){
      if (result.stat === 'ok'){
        $scope.upload.valid = true;
        $scope.upload.source = result.photo.urls.url['0']._content;
        $scope.upload.data = result.photo;

        console.log(result.photo);
        FileSrv.flickrGetSizes($scope.upload.provider_id).then(function(result){
          if (result.stat === 'ok'){
            $scope.upload.sizes = JSON.stringify(result.sizes.size);
            var t;
            for (var i=0;i<result.sizes.size.length;i++){
              if (result.sizes.size[ i].label === 'Thumbnail') {
                $scope.upload.thumbnail = result.sizes.size[ i].source;
              }
              if (result.sizes.size[ i].label === 'Large') {
                $scope.upload.url = result.sizes.size[ i].source;
              }
            }
          } else {
            $scope.upload.valid = false;
          }
        });
      } else {
        $scope.upload.valid = false;
      }
    });
  }

  $scope.startUpload = function(){
    $scope.upload.type     = 'image';
    $scope.upload.provider = 'flickr';
    $scope.upload.title    = $scope.upload.data.title._content;
    $scope.upload.description = $scope.upload.data.description._content;
    $scope.upload.user_id  = $rootScope.user.id;
    $scope.upload.license = $scope.upload.data.license;
    $scope.upload.data = JSON.stringify($scope.upload.data);

    FileSrv.create($scope.upload).then(function(result){
      if (result.id){
        $scope.file.unshift(result);
        $scope.uploaderOpen = false;
      }
    })
  }

  $scope.select = function(asset){
    $modalInstance.close(asset);
  }

  $scope.delete = function(index, asset){
    console.log('index', index);
    var deleteModal = $modal.open({
      size:'lg',
      template: '<div class="row"><div class="col-md-offset-1 col-md-10"><h3>Do you really want to delete the image?</h3><br><br><br><a href ng-click="$dismiss()">cancel</a><button class="btn btn-default btn-danger pull-right" ng-click="$close()">DELETE</button></div><br></div>'
    }).result.then(function(){
      FileSrv.destroy(asset.id).then(function(result){
        console.log(result);
        $scope.file.splice(index,1);
      });
    });
  }
});
