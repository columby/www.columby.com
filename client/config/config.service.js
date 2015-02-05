'use strict';

angular.module('columbyApp')

  .constant('configSrv', {

    version: '@@version',
    apiRoot: '@@apiRoot',
    workerRoot: '@@workerRoot',
    embedlyKey: '@@embedlyKey',
    aws: {
      endpoint: '@@awsEndpoint'
    }

  });
