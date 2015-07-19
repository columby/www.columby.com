'use strict';

angular.module('columbyApp')
  .config(function ($stateProvider) {

    $stateProvider

      .state('tag', {
        url: '/t/:slug',
        templateUrl: 'views/tag/view.html',
        controller: 'TagCtrl',
        data: {
          bodyClasses: 'tag view'
        }
      });
  });
