'use strict';

angular.module('columbyApp')

.service('SearchSrv', function ($http, $q) {

  return {
    query: function(query){
      return $http({
        method: 'get',
        url: 'api/v2/search',
        params: {query: query}
      }).then(function(response){
        var data = response.data;
        return data;
      });
    }
  };
});
