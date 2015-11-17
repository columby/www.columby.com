(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('TagService', function($resource, appConstants) {

      return $resource(appConstants.apiRoot + '/v2/tag/:slug', {
          slug: '@slug'
        }, {
          update: { method: 'PUT' },
          query:  { method: 'GET', isArray: true, responseType: 'json' }
          //get:  { method: 'GET', isArray: true, responseType: 'json' },
        }
      );
    });
})();
