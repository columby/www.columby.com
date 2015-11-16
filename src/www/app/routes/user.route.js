(function() {
  'use strict';

  angular
    .module('ng-app')
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

      // Edit the currently logged in user
      .state('user.edit', {
        url: '/:slug/edit',
        templateUrl: 'views/user/edit.html',
        // resolve: {
        //   // First try to fetch user.
        //   user: function(UserSrv, $stateParams) {
        //     return UserSrv.get($stateParams.slug);
        //   }
        // },
        controller: 'UserEditCtrl',
        data: {
          bodyClasses: 'page user edit',
          permission: 'edit user'
        }
      });
  });
})();
