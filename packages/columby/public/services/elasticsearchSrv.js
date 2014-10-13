'use strict';

angular.module('mean.columby')

.factory('SearchSrv', ['$http', '$q', function($http, $q) {


  function handleSuccess( response ) {
    console.log(response);
    return( response.data );
  }

  function handleError( response ) {
    console.log(response);
    return( $q.reject( response.data.error_message ) );
  }

  return {
    query: function(query){
      console.log('query',query);

      var request = $http({
        method: 'get',
        url: 'api/v2/search',
        params: {query: query}
      });

      return( request.then( handleSuccess, handleError ) );
    }
  };

}]);
