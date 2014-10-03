'use strict';

angular.module('mean.columby')

.factory('EmbedlySrv', ['$http', '$q', function($http, $q) {
  var key = '844b2c4d25334b4db2c327f10c70cb54';

  this.setKey = function(userKey) {
    key = userKey;
    return key;
  };

  this.getKey = function() {
    return key;
  };


  function handleSuccess( response ) {
    return( response.data );
  }

  function handleError( response ) {
    return( $q.reject( response.data.error_message ) );
  }

  return {

    embed: function(inputUrl) {
      var escapedUrl = encodeURI(inputUrl);
      var embedlyRequest = 'http://api.embed.ly/1/oembed?key=' + key + '&url=' +  escapedUrl;

      var request = $http({
          method: 'get',
          url: embedlyRequest,
      });

      return( request.then( handleSuccess, handleError ) );

    },

    extract: function(inputUrl) {
      var escapedUrl = encodeURI(inputUrl);
      var embedlyRequest = 'http://api.embed.ly/1/extract?key=' + key + '&url=' +  escapedUrl;

      var request = $http({
          method: 'get',
          url: embedlyRequest,
      });

      return( request.then( handleSuccess, handleError ) );

    }
  };
}]);
