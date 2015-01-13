'use strict';

angular.module('columbyApp')

  .constant('configSrv', {

    apiRoot: '@@apiRoot',
    workerRoot: '@@workerRoot',
    embedlyKey: '@@embedlyKey',
    aws: {
      endpoint: '@@awsEndpoint'
    }

  });
