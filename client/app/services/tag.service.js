'use strict';

angular.module('columbyApp')

  .service('TagService', function($resource, configSrv) {

    return $resource(configSrv.apiRoot + '/v2/tag/:slug', {
        slug: '@slug'
      }, {
        update: { method: 'PUT' },
        query:  { method: 'GET', isArray: true, responseType: 'json' }
        //get:  { method: 'GET', isArray: true, responseType: 'json' },
      }
    );
  })
;
