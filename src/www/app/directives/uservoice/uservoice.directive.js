(function() {
  'use strict';

  angular
    .module('ng-app')
    .directive('uservoice', function () {
    return {
      templateUrl: 'views/directives/uservoice/uservoice.html',
      restrict: 'EA'
    };
  });
})();
