(function() {
  'use strict';

  angular
    .module('columbyApp')
    .service('WorkerSrv', function($log,$http, appConstants) {

    return {

      add: function(job) {
        return $http.post(appConstants.workerRoot + '/api/job', job)
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
