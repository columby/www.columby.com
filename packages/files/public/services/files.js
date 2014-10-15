'use strict';

angular.module('mean.files')

.factory('FilesSrv', ['$http', '$resource',
  function($http, $resource) {

    var File = $resource('api/v2/files/:id',{
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    return File;
  }
]);
