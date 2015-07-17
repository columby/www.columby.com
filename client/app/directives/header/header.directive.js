'use strict';

angular.module('columbyApp')

  .directive('header', function() {

    return {
      restrict: 'EA',
      templateUrl: 'app/directives/header/header.html',
      controller: function($rootScope,$scope,$state,AuthSrv) {

        $scope.toggleSidebar = function($event){
          $event.preventDefault();
          $event.stopPropagation();
          $rootScope.$broadcast('toggleSidebar');
        }

        $scope.logout = function(){
          AuthSrv.logout();
          $state.go('home');
          ngNotify.set('You are now signed out', 'notice');
        }
      }
    };
  });
