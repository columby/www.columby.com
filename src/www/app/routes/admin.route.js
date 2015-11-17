(function() {
  'use strict';

  angular
    .module('columbyApp')
    .config(function ($stateProvider) {
      $stateProvider
        .state('admin', {
          url: '/admin',
          templateUrl: 'app/routes/admin/admin.html',
          controller: 'AdminCtrl',
          data: {
            bodyClasses: 'admin',
            permission: 'administer site'
          }
        });
    });
})();
