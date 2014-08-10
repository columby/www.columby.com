'use strict';

angular.module('mean.datasets').factory('DatasetsSrv', function ($http) {

  return {

    index: function(){
      var promise = $http.get('/api/v2/dataset/')
        .then(function (response) {
          console.log('Dataset Service Response', response.data);
          return response.data;
        });
      return promise;
    },

    create: function(dataset){
      var promise = $http.post('/api/v2/dataset', dataset)
        .then(function (response) {
          console.log('Dataset Service Response', response.data);

          return response.data;
        });
      return promise;
    },

    retrieve: function(id){

      var promise = $http.get('/api/v2/dataset/'+id)
        .then(function (response) {
          console.log('Dataset Service Response', response.data);

          return response.data;
        });
      return promise;
    },

    autoSave: function(dataset){
      var promise = $http.put('/api/v2/dataset/autosave', dataset)
        .then(function (response) {
          console.log('Dataset Service Response', response.data);
          return response.data;
        });
      return promise;
    },

  };
});
