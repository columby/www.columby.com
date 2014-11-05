'use strict';

angular.module('columbyApp')

  .service('CollectionSrv', function ($resource) {

    return $resource('api/v2/collection/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT',
      },
    }
    );

  })

;
