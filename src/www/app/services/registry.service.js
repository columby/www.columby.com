(function() {
  'use strict';

  angular
    .module('ng-app')
    .service('RegistrySrv', function($resource, appConstants) {

    return $resource(appConstants.apiRoot + '/v2/registry/:id', {
        id: '@id'
      }, {
        update: { method: 'PUT' },
        validate: {
          method: 'POST',
          url: appConstants.apiRoot + '/v2/registry/validate'
        }
      }
    );
  });
})();
