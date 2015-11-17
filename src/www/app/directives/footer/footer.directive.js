(function() {
  'use strict';

  angular
    .module('columbyApp')
    .directive('footer', function() {

    return {
      restrict: 'EA',
      templateUrl: 'views/directives/footer/footer.html'
    };
  });
})();
