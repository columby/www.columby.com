'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('terms', {
        url: '/terms',
        templateUrl: 'views/pages/terms.html',
        controller : 'PagesCtrl'
      })

      .state('about', {
        url: '/about',
        templateUrl: 'views/pages/about.html',
        controller : 'PagesCtrl'
      })

      .state('roadmap', {
        url: '/roadmap',
        templateUrl: 'views/pages/roadmap.html',
        controller : 'PagesCtrl'
      })

      .state('features', {
        url: '/features',
        templateUrl: 'views/pages/features.html',
        controller : 'PagesCtrl'
      })
      
      .state('columby-update', {
        url: '/columby-update',
        templateUrl: 'views/pages/columby-update.html',
        controller : 'PagesCtrl'
      });
  });
