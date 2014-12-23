'use strict';

angular.module('columbyApp')

  .service('TagService', function($resource) {

    return $resource('api/v2/tag/:id', {
        id: '@id'
      }, {
        update: {
          method: 'PUT'
        }
      }
    );
  })
;
