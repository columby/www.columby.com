(function() {
  'use strict';

  angular
    .module('ng-app')
    .service('PrimaryService', function($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/primary/:id', {
        id: '@id'
      }, {
        update: { method: 'PUT' },
        sync: {
          url: appConstants.apiRoot + '/v2/primary/:id/sync',
          method: 'POST'
        }
      }
    );
  });
})();
