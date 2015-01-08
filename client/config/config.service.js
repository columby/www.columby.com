'use strict';

angular.module('columbyApp')

  .constant('configSrv', {

    apiRoot: '@@apiRoot',
    embedlyKey: '@@embedlyKey',
    aws: {
      endpoint: '@@awsEndpoint'
    }

  });
