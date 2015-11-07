'use strict';

angular.module('columbyworkerApp')

  .service('WorkerService', function($http) {

    return {
      stats: function () {
        return $http({
          method: 'GET',
          url: '/api/stats'
        }).then(function (result) {
          console.log('status: ', result.data);
          return result.data;
        });
      },

      jobs: function(params){
        console.log(params);
        return $http({
          method: 'get',
          url: '/api/job',
          params: params
        }).then(function(result){
          return result.data;
        });
      }
    }
  });
