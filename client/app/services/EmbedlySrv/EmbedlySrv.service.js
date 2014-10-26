'use strict';

angular.module('columbyApp')
  .service('EmbedlySrv', function ($http,$q,configuration) {
    var key = configuration.embedly.key;

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
  });
