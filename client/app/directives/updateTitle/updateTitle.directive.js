'use strict';

angular.module('columbyApp')

// Directive to change the html page title.
// state in ui-router needs a data.pageTitle
.directive('updateTitle', function($rootScope) {
  return {
    link: function(scope, element) {

      var listener = function(event, toState) {

        var title = 'data publishing';
        if (toState.data && toState.data.pageTitle) {
          title = toState.data.pageTitle;
        }
        // Set asynchronously so page changes before title does
        element.text('columby.com | ' + title);
      };

      $rootScope.$on('$stateChangeStart', listener);
    }
  };
});
