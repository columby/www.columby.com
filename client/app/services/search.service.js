'use strict';

angular.module('columbyApp')

.service('SearchSrv', function ($http, configSrv) {

  return {
    // TODO: Marcel. universele service naar columby search api
    query: function(query){
      return $http({
        method: 'get',
        url: configSrv.apiRoot + '/v2/search',
        params: {
          query: query.text,
          options: query.options
        }
      }).then(function(response){
        return response.data;
      });
    }
  };
});
