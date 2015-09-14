// Will be overwritten by gulp['constants'] based on NODE_ENV

(function() {
  'use strict';

  angular.module('columbyApp').constant('appConstants', window.settings);
})();
