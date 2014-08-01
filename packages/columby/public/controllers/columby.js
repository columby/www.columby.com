'use strict';

angular.module('mean.columby')
  .controller('ColumbyLoginCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      // This object will be filled by the form
      $scope.user = {};
      $scope.user.email = 'arn@urbanlink.nl';

      // Register the login() function
      $scope.requestToken = function() {
        $scope.requestingToken = true;

        $http.post('/api/user/sendtoken', {
          user: $scope.user.email
        })
        .success(function(response) {
          console.log('Requesting token response: ');
          console.log(response);
          $scope.requestingToken = false;
          // respond to response
          if (response.status === 'success') {
            $scope.signinSuccess = true;
          } else if (response.statusCode === 2) {
            $scope.logininfo = 'The email adress ' + $scope.user.email + ' is not registered. Would you like to register? ';
            $scope.requestingToken = false;

            $scope.newuser = {};
            $scope.newuser.email = $scope.user.email;
            $scope.newuser.username = $scope.newuser.email.split('@')[0];
            $scope.showRegister=true;
          }
          //$location.url('/success');
        })
        .error(function() {
          $scope.logininfo = 'The email adress ' + $scope.user.email + ' is not registered. Would you like to register? ';
          $scope.requestingToken = false;

          $scope.newuser = {};
          $scope.newuser.email = $scope.user.email;
          $scope.newuser.username = $scope.newuser.email.split('@')[0];
          $scope.showRegister=true;
        });
      };

      $scope.register = function() {
        $scope.registerInProgress = true;
        console.log('starting registration: ' + $scope.newuser.email + ', ' + $scope.newuser.username);

        $http.post('/api/user/register', {
          user: $scope.newuser.email,
          username: $scope.newuser.username
        })
        .success(function(response) {
          console.log('Requesting token response: ');
          console.log(response);
          $scope.requestingToken = false;
          if (response.status === 'success') {
            $scope.signinSuccess = true;
          }
        })
        .error(function(e) {
          console.log('error');
          console.log(e);
          $scope.loginerror = 'There was an error during registration.';
        });
      };
    }
  ])

  .controller('ColumbyAuthenticateController', ['$rootScope','$scope', 'Global', 'Columby', '$location','$http',
    function($rootScope, $scope, Global, Columby, $location,$http) {
      $scope.global = Global;
      $scope.package = {
        name: 'columby'
      };

      // get parameters
      var params = $location.search();
      if (params.uid && params.token) {
        $scope.authenticateMessage = 'yes';
        // authenticate
        $http({
          method: 'GET',
          url: '/',
          params: {
            uid: params.uid,
            token: params.token
          }
        })
        .success(function(response){
          // handle login
          //console.log(response);
          $location.url('/');
          if (response.status === 'success') {
            // authentication OK
            $scope.loginError = 0;
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              console.log('redirect');
              //$location.url('/');
            }
          }
        })
        .error(function(err){
          console.log(err);
        });
      } else {
        $scope.authenticateMessage = 'No credentials given (uid, token)';
      }

    }
  ])

  .controller('ColumbyController', ['$rootScope','$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;
    $scope.package = {
      name: 'columby'
    };

    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);

angular.module('mean.columby').controller('SiteNavController', ['$rootScope', '$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;
    //console.log(Global);
    // For every state change, disable the sitenav panel
    $scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.$broadcast('sitenav::toggle', 'close');
    });

    // respond to an event from rootscope to toggle the sitenav panel. Most likely this comes from the metabar icon.
    $scope.$on('sitenav::toggle', function(event, action) {
      console.log(action);
      switch (action){
        case 'close':
          $scope.showSiteNav = false;
          angular.element('body').removeClass('sitenav-open');
          break;
        case 'open':
          $scope.showSiteNav = true;
          angular.element('body').addClass('sitenav-open');
          break;
        default:
        case 'toggle':
          $scope.showSiteNav = !$scope.showSiteNav;
          if ($scope.showSiteNav === true) {
            angular.element('body').addClass('sitenav-open');
          } else {
            angular.element('body').removeClass('sitenav-open');
          }
        }
    });

    // function to send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);

angular.module('mean.columby').controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby',
  function($rootScope, $scope, Global, Columby) {
    $scope.global = Global;
    console.log('Metabar controller loaded');

    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

  }
]);
