'use strict';

angular.module('columbyApp')

  .service('WorkerSrv', function($http, configSrv) {

    return {

      add: function(job) {
        console.log(configSrv.workerRoot);
        return $http.post(configSrv.workerRoot + '/job', job)
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
