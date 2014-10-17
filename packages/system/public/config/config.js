'use strict';

angular.module('mean.system')
  .constant('configuration', {

    aws: {
      publicKey : 'AKIAIA6FZGJ3WN5NKSXA',
      bucket    : 'columby-dev',
      endpoint  : 's3.amazonaws.com/columby-dev'
    }

  })
;
