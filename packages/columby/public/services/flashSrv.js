'use strict';

/***
 *
 * Message Flash Service
 *
 ***/

/*
message
  text
  status
  queued
*/

angular.module('mean.columby').factory('FlashSrv', ['$rootScope', function($rootScope) {

  var queue = [];
  var currentMessage = '';

  return {

    setMessage: function(message) {

      queue.push(message);

      if (!message.queued) {
        $rootScope.$broadcast('flashMessage::newMessage', message);
      }
    },

    getMessage: function() {
      currentMessage = queue.shift() || '';
      //console.log('Getting Message');
      //console.log(currentMessage);
      $rootScope.$broadcast('flashMessage::newMessage', currentMessage);
    }
  };
}]);
