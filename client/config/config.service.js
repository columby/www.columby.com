'use strict';

angular.module('columbyApp')

  .constant('configSrv', {

    version   : '@@version',
    apiRoot   : '@@apiRoot',
    workerRoot: '@@workerRoot',
    filesRoot : '@@filesRoot',
    embedlyKey: '@@embedlyKey',
    aws: {
      endpoint: '@@awsEndpoint'
    }

  });
