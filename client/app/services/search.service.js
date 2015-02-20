'use strict';

angular.module('columbyApp')

.service('SearchSrv', function ($http, configSrv) {

  var queryTerm = '';
  var result = {};

  return {

    // placeholder for last search result
    result: function(){
      return result;
    },
    queryTerm: function(){
      return queryTerm;
    },

    query: function(_query){
      queryTerm = _query.text;
      return $http({
        method: 'get',
        url: configSrv.apiRoot + '/v2/search',
        params: {
          query: _query.text,
          options: _query.options
        }
      }).then(function(response){
        // store search result in this service
        result = response.data;
        // send back result
        return response.data;
      });
    }
  };
});
