'use strict';

angular.module('columbyApp')

  .constant('appConstants', {

    version   : '@@version',
    apiRoot   : '@@apiRoot',
    workerRoot: '@@workerRoot',
    filesRoot : '@@filesRoot',
    embedlyKey: '@@embedlyKey',
    aws: {
      endpoint: '@@awsEndpoint'
    }

  });
