(function() {
  'use strict';

  angular.module('columbyApp')
  .directive('fileManager', function() {

    return {
      restrict: 'AE',
      replace: 'true',
      controller: 'FileManagerCtrl',
      scope: {},
      templateUrl: 'views/directives/fileManager/fileManager.html'
    };
  });
})();
