'use strict';

angular.module('mean.system')
  .constant('configuration', {

    aws: {
      publicKey : 'AKIAIERE7X62EYZM23HA',
      bucket    : 'columby-dev',
      endpoint  : 'columby-dev.s3-us-west-2.amazonaws.com',
    },
    elasticsearch : {
      url : 'http://localhost:9201',
      log : 'trace'
    }
  })
;
