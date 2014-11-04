'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('terms', {
        url: '/terms',
        templateUrl: 'app/routes/pages/views/terms.html',
        controller : 'PagesCtrl'
      })

      .state('about', {
        url: '/about',
        templateUrl: 'app/routes/pages/views/about.html',
        controller : 'PagesCtrl'
      })

      .state('roadmap', {
        url: '/roadmap',
        templateUrl: 'app/routes/pages/views/roadmap.html',
        controller : 'PagesCtrl'
      })

      .state('features', {
        url: '/features',
        templateUrl: 'app/routes/pages/views/features.html',
        controller : 'PagesCtrl'
      })
      
      .state('columby-update', {
        url: '/columby-update',
        templateUrl: 'app/routes/pages/views/columby-update.html',
        controller : 'PagesCtrl'
      });
  });
