(function() {
  'use strict';

  angular
    .module('columbyApp')
    .config(function ($stateProvider) {
    $stateProvider

      .state('user', {
        abstract: true,
        url: '/u',
        template: '<ui-view/>'
      })

      .state('user.signin', {
        url: '/signin',
        templateUrl: 'views/user/signin.html',
        controller: 'UserSigninCtrl',
        data: {
          bodyClasses: 'page user signin',
          permission: 'signin user'
        }
      })

      .state('user.verify', {
        url: '/verify',
        templateUrl: 'views/user/verify.html',
        controller: 'UserVerifyCtrl',
        data: {
          bodyClasses: 'page user verify',
          permission: 'verify user login'
        }
      })

      .state('user.signup', {
        url: '/signup',
        templateUrl: 'views/user/signup.html',
        controller: 'UserSignupCtrl',
        data: {
          bodyClasses: 'page user signup',
          permission: 'signup user'
        }
      })

      .state('user.edit', {
        url: '/:slug/edit',
        templateUrl: 'views/user/edit.html',
        resolve: {
          // First try to fetch dataset.
          user: function(UserSrv, $stateParams) {
            return UserSrv.get($stateParams.slug);
          }
        },
        controller: 'UserEditCtrl',
        data: {
          bodyClasses: 'page user edit',
          permission: 'edit user'
        }
      });
  });
})();
