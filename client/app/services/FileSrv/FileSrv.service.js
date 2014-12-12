'use strict';

angular.module('columbyApp')
  .service('FileSrv', function ($http) {

    return {

      /**
       *
       * Check if the file is an image
       *
       **/
      validateImage: function(type){
        var validTypes = [ 'image/png', 'image/jpg', 'image/jpeg' ];

        return (validTypes.indexOf(type) !== -1);
      },

      /**
       *
       * Request a signed request for uploading to S3 from the server.
       *
       **/
      signS3: function(params) {
        var promise = $http({
          method: 'GET',
          url: 'api/v2/file/sign',
          params: params
        }).then(function(result){
          return result.data;
        });
        return promise;
      },

      /**
       * Upload a file to s3
       */
      upload: function(file, params){


      },

      handleS3Response: function(s3Response){
        var data = window.xml2json.parser(s3Response);
        return {
          location: decodeURIComponent(data.postresponse.location),
          bucket: data.postresponse.bucket,
          key: data.postresponse.key,
          etag: data.postresponse.etag
        };
      },

      finishS3: function(params) {
        // upload finished, update the file reference
        console.log('params', params);
        var promise = $http({
          method: 'POST',
          url: 'api/v2/file/s3success',
          data: {
            fileId: params.fid,
            url: params.url
          }
        }).then(function (result) {
          console.log(result);
          return result.data;
        });
        return promise;
      },

      createDerivative: function(url){
        return $http({
          method: 'GET',
          url: 'api/v2/file/createDerivative',
          params:{
            url:url
          }
        }).then(function(response) {
          console.log(response);
          return response.data;
        });
      }
    };
  });
