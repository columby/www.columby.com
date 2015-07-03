/***
 *
 * Metabar component (directive)
 *
 * The CSS file is located in the general styles folder (styles/components/metabar.less)
 *
 ***/

'use strict';

angular.module('columbyApp')

  .directive('metabar', function(AuthSrv) {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/metabar/metabar.html',
      controller: function($scope){}
    };
  });
