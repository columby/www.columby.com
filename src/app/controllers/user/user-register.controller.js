(function() {
  'use strict';

  angular.module('columbyApp').controller('UserSignupCtrl', function($log,$window, $scope, $rootScope, $location, $http, $state, AccountSrv, UserSrv, ngNotify, Slug, AuthSrv) {

    $rootScope.title = 'Signup | columby.com';

    // if user is already logged in
    if($rootScope.user.id){
      ngNotify.set('You are already logged in.', 'error');
      $state.go('user.edit');
    }

    $scope.register = function(provider){

      // Set the type of provider and necessary details.
      var p = {
        service: provider,
        register: 'true'
      };
      if ($scope.newuser) {
        p.email = $scope.newuser.email || '';
        p.displayName = $scope.newuser.name || '';
      }
      $log.debug(p);
      AuthSrv.authenticate(p).then(function(response){
        $log.debug(response);
        if (response.status === 'warning'){
          $scope.message = '<p class="bg-danger">' + response.msg + '</p>';
        }

        else if (response.status === 'warning') {
          $scope.message = '<p class="bg-danger">Sorry, there was an error signing up.</p>';
        }
        else if (response.user.id) {
          ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
          $state.go('home');
        }

      });
    };

    $scope.slugifyName = function(){
      if ($scope.newuser.name){
        var n = Slug.slugify($scope.newuser.name);
        while(n.length<3){
          n = n+'-';
        }
        $scope.newuser.name = n;
      }
    };
  });
})();
