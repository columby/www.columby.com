(function() {
  'use strict';

  angular
    .module('ng-app')
    .directive('footer', function() {

    return {
      restrict: 'EA',
      templateUrl: 'views/directives/footer/footer.html'
    };
  });
})();
