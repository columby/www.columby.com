'use strict';

angular.module('mean.columby').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    // view own profile
    // redirect to /profile/username based on id
    .state('me', {
      url:'/me',
      templateUrl: 'columby/views/profile.html',
      authorization: {
        authorizedRoles: ['authenticated'],
        permissions:[
          'can view own profile',
          'can view all profiles'
        ]
      }
    })

    // view public profile of any member
    .state('profile view', {
      url:'/profile/:username',
      templateUrl: 'columby/views/profile.html',
      authorization: {
        permissions:[
          'can view own profile',
          'can view all profiles'
        ]
      }
    })

    // Edit account settings
    .state('account', {
      url:'/me/account',
      templateUrl: 'columby/views/account.html',
      authorization: {
        authorizedRoles: ['authenticated'],
        permissions:[
          'can edit own account',
          'can edit accounts'
        ]
      }
    })

    .state('publish', {
      url: '/publish',
      templateUrl: 'columby/views/publish.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    })

    .state('signin', {
      url: '/signin',
      templateUrl: 'columby/views/signin.html',
      authorization: {
        anonymousOnly: true
      }

    })
    ;
  }
]);
