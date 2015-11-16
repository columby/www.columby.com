(function() {
  'use strict';

  angular
    .module('ng-app')
    .config(function ($stateProvider) {

  $stateProvider

    .state('search', {
      url: '/search',
      templateUrl: 'views/search/search.html',
      controller: 'SearchCtrl',
      data: {
        bodyClasses: 'page search'
      }
    });
});
})();
