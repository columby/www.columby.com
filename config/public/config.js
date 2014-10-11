'use strict';

angular.module('mean.system')
  .constant('configuration', {

    aws: {
      publicKey : '@@AWS_ACCESS_KEY_ID',
      bucket    : '@@S3_BUCKET_NAME',
      endpoint  : '@@AWS_S3_ENDPOINT',
    },
    elasticsearch : {
      url : '@@ELASTICSEARCH_URL',
      log : '@@ELASTICSEARCH_LOG'
    }
  })
;
