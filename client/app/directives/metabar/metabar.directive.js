/***
 *
 * Metabar component (directive)
 *
 * The CSS file is located in the general styles folder (styles/components/metabar.less)
 *
 ***/

'use strict';

angular.module('columbyApp')

  .directive('metabar', function($state, ngNotify, AuthSrv) {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/metabar/metabar.html',
      controller: function($scope, AuthSrv){

        $scope.logout = function(){
          AuthSrv.logout();
          $state.go('home');
          ngNotify.set('You are now signed out', 'notice');
        }

      }
    };
  });
