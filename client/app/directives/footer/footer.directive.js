/***
 *
 * Main footer component (directive)
 *
 * The CSS file is located in the general styles folder (styles/components/footer.less)
 *
 ***/

'use strict';

angular.module('columbyApp')

  .directive('footer', function() {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/footer/footer.html'
    };
  });
