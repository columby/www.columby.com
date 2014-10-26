'use strict';

angular.module('columbyApp')
  .directive('uservoice', function () {
    return {
      templateUrl: 'app/directives/uservoice/uservoice.html',
      restrict: 'EA'
    };
  });
