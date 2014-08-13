'use strict';

/***
 * Message Flash Service
 ***/
angular.module('mean.columby').factory('MetabarSrv', ['$rootScope', function($rootScope) {

  var postMeta = null;

  return {

    setPostMeta: function(meta) {
      postMeta = meta;
      $rootScope.$broadcast('metabar::newMeta', meta);
    },

    getPostMeta: function() {
      return postMeta;
    },

    clearPostMeta: function(){
      postMeta = null;
    }

  };
}]);
