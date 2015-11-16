// Will be overwritten by gulp['constants'] based on NODE_ENV

(function() {
  'use strict';

  angular.module('ng-app').constant('appConstants', window.settings);
})();
