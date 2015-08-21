(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('DistributionSrv', function($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/distribution/:id', {
        id: '@id'
      }, {
        update: {
          method: 'PUT'
        },
        validateLink: {
          method: 'POST',
          url: appConstants.apiRoot + '/v2/distribution/validate-link'
        }
      }
    );
  });
})();
