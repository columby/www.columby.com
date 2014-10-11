'use strict';

angular.module('mean.columby')

.factory('elasticsearchSrv', ['esFactory','configuration', function(esFactory,configuration) {
    // this will actually create a "Client"-Instance which you can configure as you wish.
    console.log('conf',configuration);

    return esFactory({
      host          : configuration.elasticsearch.host,
      sniffOnStart  : true,
      sniffInterval : 300000,
      log           : 'trace'
    });
}]);
