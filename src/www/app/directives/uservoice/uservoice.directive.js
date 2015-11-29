(function() {
  'use strict';

  angular
    .module('columbyApp')
    .directive('uservoice', function () {
    return {
      templateUrl: 'views/directives/uservoice/uservoice.html',
      restrict: 'EA'
    };
  });
})();
