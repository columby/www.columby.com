(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('DataService', function($http, appConstants) {

    return {

      sql: function(query) {
        return $http({
          method: 'GET',
          url: appConstants.apiRoot + '/v2/data/sql',
          params: {q:query}})
          .then(function (response) {
            return response.data;
          });
      }

      // job status

      // job log

      // delete job

      // list jobs based on ID

      //

    };
  });
})();
