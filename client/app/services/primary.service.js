'use strict';

angular.module('columbyApp')

  .service('PrimaryService', function($resource) {

    return $resource('api/v2/primary/:id', {
        id: '@id'
      }, {
        update: {
          method: 'PUT'
        }
      }
    );
  })
;
