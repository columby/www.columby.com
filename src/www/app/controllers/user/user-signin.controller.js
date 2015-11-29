 (function() {

  'use strict';

  angular
  .module('columbyApp')
  .controller('UserSigninCtrl', function($scope, AuthSrv) {

    $scope.login = function(){
      AuthSrv.login();
    };

    $scope.login();

  });
})();
