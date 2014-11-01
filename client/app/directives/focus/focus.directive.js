'use strict';

angular.module('columbyApp')

.directive('focus', function($timeout) {
  return {
    scope : {
      trigger : '@focus'
    },
    link : function(scope, element) {
      scope.$watch('trigger', function() {
        $timeout(function() {
          element[0].focus();
          element[0].setSelectionRange(0,0);
        });
      });
    }
  };
});
