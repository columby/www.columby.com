'use strict';

angular.module('columbyApp')

  .service('DistributionSrv', function($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/distribution/:id', {
        id: '@id'
      }, {
        update: {
          method: 'PUT'
        },
        validateLink: {
          method: 'POST',
          url: configSrv.apiRoot + '/v2/distribution/validate-link'
        }
      }
    );
  })
;
