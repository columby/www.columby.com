'use strict';

angular.module('columbyApp')
  .directive('test', function () {
    return {
      templateUrl: 'app/directives/test/test.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
