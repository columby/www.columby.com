'use strict';

angular.module('mean.columby')

.factory('elasticsearchSrv', ['esFactory', function(esFactory) {
    // this will actually create a "Client"-Instance which you can configure as you wish.
    return esFactory({
      host: 'localhost:9201',
      sniffOnStart: true,
      sniffInterval: 300000,
      log: 'trace'
    });
}]);
