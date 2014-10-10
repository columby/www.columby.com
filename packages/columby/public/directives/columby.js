'use strict';

// Common directive for Focus
angular.module('mean.columby')

.directive('focus', function($timeout) {
  return {
    scope : {
      trigger : '@focus'
    },
    link : function(scope, element) {
      scope.$watch('trigger', function(value) {
        if (value === 'true') {
          $timeout(function() {
            element[0].focus();
            element[0].setSelectionRange(0,0);
          });
        }
      });
    }
  };
});
