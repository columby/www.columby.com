'use strict';

angular.module('columbyApp')
  .controller('PagesCtrl', function ($window, $state) {

    $window.document.title = 'columby.com | ' + $state.current.name;

  });
