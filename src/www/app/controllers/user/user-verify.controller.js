(function() {
  'use strict';

  angular.module('columbyApp').controller('UserVerifyCtrl', function($rootScope, $scope,$location, $state, UserSrv, ngNotify) {

    var token = $location.search().token;

    UserSrv.verify(token).then(function(result){
      if (result.status==='error') {
        $scope.message = result.err;
        ngNotify.set('There was an error verifying the login. Please try again.', 'error');
        delete $scope.verificationInProgress;
      } else if ( (result.user) && (result.user.id) ) {
        ngNotify.set('You have succesfully signed in.');
        $state.go('home');
      }
    });
  });
})();
