(function() {
  'use strict';

  angular
    .module('columbyApp')
    .controller('PagesCtrl', function ($rootScope, $state) {

    $rootScope.title = 'columby.com | ' + $state.current.name;

  });
})();
