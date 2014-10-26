'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('terms', {
        url: '/terms',
        templateUrl: 'app/routes/pages/views/terms.html',
      })

      .state('about', {
        url: '/about',
        templateUrl: 'app/routes/pages/views/about.html',
      })

      .state('roadmap', {
        url: '/roadmap',
        templateUrl: 'app/routes/pages/views/roadmap.html',
      })

      .state('features', {
        url: '/features',
        templateUrl: 'app/routes/pages/views/features.html',
      })
  });
