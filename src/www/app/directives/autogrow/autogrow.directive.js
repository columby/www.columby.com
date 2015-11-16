/**
 * https://gist.github.com/thomseddon/4703968
 */


(function() {
  'use strict';
  angular.module('ng-app').directive('autoGrow', function($window) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.on('input propertychange', update);

        function update() {
          var scrollTop = $window.pageYOffset,
            scrollLeft = $window.pageXOffset;

          element.css('height', 'auto');
          var height = element[0].scrollHeight;

          if (height > 0) {
            element.css('height', height + 'px');
          }

          $window.scrollTo(scrollLeft, scrollTop);
        }
      }
    };
  });
})();
