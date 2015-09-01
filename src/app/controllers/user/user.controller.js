(function() {
  'use strict';

  angular.module('columbyApp')
  .controller('SigninCtrl', function ($log,$rootScope, $scope, $state, UserSrv, AuthSrv, ngNotify, $modal) {

    // Set page title
    $rootScope.title = 'Sign in | columby.com';

    // Check if user is not already logged in
    if (AuthSrv.isAuthenticated()) {
      $state.go('settings');
      ngNotify.set('You are already logged in.');
    }


    // Handle login authentication
    $scope.authenticate = function(p){

      // Open up a loading modal
      var modal = $modal.open({
        size: 'lg',
        templateUrl: 'views/user/partials/modal-inprogress.html',
        controller: function(){ }
      });

      // Set the type of provider and necessary details.
      var provider = {
        service: p,
        email: $scope.email,
        register: 'false'
      };

      // Authenticate with the authentication service.
      AuthSrv.authenticate(provider).then(function(response){
        $log.debug(response);
        modal.dismiss();

        if (response.status === 'warning'){
          ngNotify.set(response.msg, 'error');
        } else if (response.status === 'wrong_provider'){
          ngNotify.set(response.msg, 'error');
        } else if (response.status==="success") {
          // Handle email login
          if (provider.service === 'email'){
            if (response.status === 'success') {
              var successModal = $modal.open({
                size: 'lg',
                templateUrl: 'views/user/partials/modal-email-success.html',
              });
            }
          }
        } else if (response.user && response.user.id) {
          ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
          $state.go('home');
        } else if (response.status === 'not_found') {

          ngNotify.set('The email address ' + $scope.email + ' does not exist. Would you like to register for a new account?', 'warning');
          $scope.newuser={};
          $scope.newuser.email = $scope.email;

          var newmail = $scope.email.replace(/@.*$/,'').substring(0,20);
          for (var c=0; newmail.length < 3; c++) {
            newmail = newmail + c;
          }
          $scope.newuser.name = newmail;

        } else {
          ngNotify.set('Sorry, something went wrong... ' + JSON.stringify(response.err), 'error');
        }
      });
    };
    });
})();


/***
 *
 * Check if user sent a verification token with page request.
 *
 ***/
 (function() {
   'use strict';

   angular
     .module('columbyApp')
     .controller('UserVerifyCtrl', function($rootScope, $scope,$location, $state, UserSrv, ngNotify){

  var token = $location.search().token;

  UserSrv.verify(token).then(function(result){
    if (result.status==="error") {
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


/***
 *
 * Register controller for a new user.
 *
 ***/
 (function() {
   'use strict';

   angular
     .module('columbyApp')
     .controller('RegisterCtrl', function($log,$window, $scope, $rootScope, $location, $http, $state, AccountSrv, UserSrv, ngNotify, Slug, AuthSrv,$modal) {

  $rootScope.title = 'Register | columby.com';

  // if user is already logged in
  if($rootScope.user.id){
    ngNotify.set('You are already logged in.', 'error');
    $state.go('settings');
  }

  $scope.register = function(provider){

    // Open up a loading modal
    var modal = $modal.open({
      size: 'lg',
      templateUrl: 'views/user/partials/modal-inprogress.html',
      controller: function(){ }
    });

    // Set the type of provider and necessary details.
    var provider = {
      service: provider,
      email: $scope.newuser.email,
      displayName: $scope.newuser.name,
      register: 'true'
    };

    $log.debug('p', provider);

    AuthSrv.authenticate(provider).then(function(response){

      $log.debug(response);
      if (response.status === 'warning'){
        ngNotify.set(response.msg, 'error');
        modal.dismiss();
      } else if (response.user.id) {
        ngNotify.set('Welcome, you are now signed in at Columby!', 'notice');
        $state.go('settings');
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
