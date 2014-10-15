'use strict';

angular.module('mean.files')

.directive('fineuploader', function(configuration, $http, FilesSrv){

  return {

    restrict:'A',

    templateUrl: 'files/views/uploader.html',

    link: function(scope,element,attrs) {

      console.log(configuration);
      var settings = configuration.aws;
      settings.authorization = $http.defaults.headers.common.Authorization;
      console.log(settings);

      // attach to model

      // model_id
      element.fineUploaderS3({
        debug: true,
        objectProperties: {
          acl: 'public-read'
        },
        request: {
          endpoint: settings.endpoint,
          accessKey: settings.publicKey,
        },
        signature: {
          endpoint: '/api/v2/files/s3handler',
          customHeaders: {
            Authorization: settings.authorization,
          },
        },
        uploadSuccess: {
          endpoint: '/api/v2/files/s3success',
          customHeaders: {
            Authorization: settings.authorization,
          },
        },
        iframeSupport: {
          localBlankPagePath: '/s3/success.html'
        },
        retry: {
         enableAuto: true // defaults to false
        },
        deleteFile: {
          enabled: true,
          endpoint: '/api/v2/files/s3handler',
          customHeaders: {
            Authorization: settings.authorization,
          },
        },
        callbacks: {
          onComplete: function(id,name,res,xhr) {
            scope.files.unshift(res);
            scope.$apply();
          }
        }
      });
    }
  };
})

;
