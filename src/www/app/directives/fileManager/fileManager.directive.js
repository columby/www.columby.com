(function() {
  'use strict';

  angular
    .module('ng-app')
    .directive('fileManager', function() {

    return {
      restrict: 'AE',
      replace: 'true',
      controller: 'FileManagerCtrl'
    };
  });
})();
