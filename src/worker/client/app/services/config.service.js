'use strict';

angular.module('columbyworkerApp')

  .constant('configSrv', {
    apiRoot: '//api.columby.com',
    version: 'v1.0.2',
    workerApiRoot: '//worker.columby.com'
  });
