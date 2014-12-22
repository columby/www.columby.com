'use strict';

angular.module('columbyApp')

  .service('DistributionSrv', function($resource) {

    return $resource('api/v2/distribution/:id', {
        id: '@id'
      }, {
        update: {
          method: 'PUT'
        },
        validateLink: {
          method: 'POST',
          url: 'api/v2/distribution/validate-link'
        }
      }
    );
  })
;
