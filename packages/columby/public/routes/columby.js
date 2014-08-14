'use strict';

angular.module('mean.columby').config(['$stateProvider', '$locationProvider',
  function($stateProvider,$locationProvider) {

    $stateProvider

    .state('home', {
      url:'/',
      templateUrl: 'columby/views/home.html'
    })

    .state('signin', {
      url: '/signin',
      templateUrl: 'columby/views/signin.html',
      authorization: {
        anonymousOnly: true
      }
    })


    // Edit account settings
    .state('settings', {
      url:'/settings',
      templateUrl: 'columby/views/account.html',
      authorization: {
        authorizedRoles: ['authenticated'],
        permissions:[
          'can edit own account',
          'can edit accounts'
        ]
      }
    })

    .state('terms', {
      url: '/terms',
      templateUrl: 'columby/views/terms.html',
    })
    
    .state('publish', {
      url: '/publish',
      templateUrl: 'columby/views/publish.html',
      authorization: {
        authorizedRoles: ['authenticated']
      }
    })

    // view own profile
    // redirect to /profile/username based on id
    .state('profile', {
      url:'/:userSlug',
      templateUrl: 'columby/views/profile.html',
      authorization: {
        authorizedRoles: ['authenticated'],
        permissions:[
          'can view own profile',
          'can view all profiles'
        ]
      }
    })

    ;
  }
]);
