'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {
    $stateProvider

      .state('terms', {
        url: '/terms',
        templateUrl: 'views/pages/terms.html',
        controller : 'PagesCtrl',
        data: {
          bodyClasses: 'page terms'
        }
      })

      .state('about', {
        url: '/about',
        templateUrl: 'views/pages/about.html',
        controller : 'PagesCtrl',
        data: {
          bodyClasses: 'page about'
        }
      })

      .state('roadmap', {
        url: '/roadmap',
        templateUrl: 'views/pages/roadmap.html',
        controller : 'PagesCtrl',
        data: {
          bodyClasses: 'page roadmap'
        }
      })

      .state('features', {
        url: '/features',
        templateUrl: 'views/pages/features.html',
        controller : 'PagesCtrl',
        data: {
          bodyClasses: 'page features'
        }
      })

      .state('columby-update', {
        url: '/columby-update',
        templateUrl: 'views/pages/columby-update.html',
        controller : 'PagesCtrl',
        data: {
          bodyClasses: 'page single'
        }
      });
  });
