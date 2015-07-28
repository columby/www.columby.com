/**
 *
 * https://github.com/asafdav/ng-s3upload
 *
 * Sign: Get a signed request from columby to upload directly to Columby. { filetype, size, filename, accountId )
 * Upload: Upload directly to Amazon S3
 * Finish: Send a message to Columby to finish the upload process.
 *
 */

'use strict';

angular.module('columbyApp')

  .service('FileSrv', function ($log, $http, $q, configSrv) {

    return {

      // Get a list of files from the server for a given account
      query: function(params){
        return $http({
          url: configSrv.apiRoot + '/v2/file',
          params: params,
          method: 'GET'
        }).then(function(result){
          return result.data;
        });
      },


      // Get a signed request for uploading to S3 from the server.
      sign: function(params) {
        return $http({
          method: 'POST',
          url: configSrv.apiRoot + '/v2/file/sign',
          data: params
        }).then(function(result){
          return result.data;
        });
      },


      // Finish the S3 request.
      finishUpload: function(data) {
        return $http({
          method: 'POST',
          url: configSrv.apiRoot + '/v2/file/finish-upload',
          data: data
        }).then(function (result) {
          return result.data;
        });
      },




      // Check if the file is an image
      validateFile: function(filetype, type) {
        $log.log('validating filetype: ' + filetype + ' with type: ' + type);
        var validTypes;
        if (type === 'image') {
          validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
          return (validTypes.indexOf(filetype) !== -1);
        } else if(type === 'file'){
          validTypes = ['application/pdf'];
          return (validTypes.indexOf(filetype) !== -1);
        } else if (type === 'datafile'){
          validTypes = ['text/csv']
          return (validTypes.indexOf(filetype) !== -1);
        }
        return false;
      }
    };
  });
