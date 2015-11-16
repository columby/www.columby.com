(function() {
  'use strict';

  angular
    .module('ng-app')  .config(function ($stateProvider) {

    $stateProvider

      .state('home', {
        url: '/',
        templateUrl: 'views/home/home.html',
        controller: 'HomeCtrl',
        data: {
          bodyClasses: 'home'
        }
      });
  });
})();
