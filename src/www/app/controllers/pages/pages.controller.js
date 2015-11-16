(function() {
  'use strict';

  angular
    .module('ng-app')
    .controller('PagesCtrl', function ($rootScope, $state) {

    $rootScope.title = 'columby.com | ' + $state.current.name;

  });
})();
