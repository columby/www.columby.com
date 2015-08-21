(function() {
  'use strict';

  angular
    .module('columbyApp')
    .config(function ($stateProvider) {

  $stateProvider

    .state('tag', {
      abstract: true,
      url: '/t',
      template: '<ui-view/>'
    })
    .state('tag.view', {
      url: '/:slug',
      templateUrl: 'views/tag/view.html',
      controller: 'TagCtrl',
      data: {
        bodyClasses: 'tag view'
      }
    });
});
})();
