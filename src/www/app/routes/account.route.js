(function() {
  'use strict';

  angular
    .module('columbyApp')
    .config(function ($stateProvider) {
    $stateProvider

      .state('account', {
        abstract: true,
        url: '/a',
        template: '<ui-view/>'
      })

      .state('account.view', {
        url: '/:slug',
        templateUrl: 'views/account/view.html',
        resolve: {
          // First try to fetch dataset.
          account: function(AccountSrv, $stateParams) {
            return AccountSrv.get({slug: $stateParams.slug}).$promise;
          }
        },
        controller: 'AccountCtrl',
        data: {
          bodyClasses: 'page account view',
          permission: 'view account'
        }
      })

      .state('account.edit', {
        url: '/:slug/edit',
        templateUrl: 'views/account/edit.html',
        resolve: {
          // First try to fetch dataset.
          account: function(AccountSrv, $stateParams) {
            return AccountSrv.get({slug: $stateParams.slug}).$promise;
          }
        },
        controller: 'AccountEditCtrl',
        data: {
          bodyClasses: 'account organisation edit',
          permission: 'edit organisation'
        }
      })

      .state('account.categories', {
        url: '/:slug/category',
        templateUrl: 'views/account/categories/index.html',
        resolve: {
          // First try to fetch dataset.
          account: function(AccountSrv, $stateParams) {
            return AccountSrv.get({slug: $stateParams.slug}).$promise;
          }
        },
        controller: 'AccountCategoriesCtrl',
        data: {
          bodyClasses: 'account organisation categories'
        }
      })
      .state('account.category', {
        url: '/:slug/category/:id',
        templateUrl: 'views/account/categories/show.html',
        resolve: {
          category: function(CategorySrv, $stateParams) {
            return CategorySrv.get({id: $stateParams.id}).$promise;
          },
          account: function(AccountSrv, $stateParams) {
            return AccountSrv.get({slug: $stateParams.slug}).$promise;
          },
          datasets: function(CategorySrv,$stateParams) {
            return CategorySrv.getDatasets({id: $stateParams.id}).$promise;
          }
        },
        controller: 'AccountCategoryCtrl',
        data: {
          bodyClasses: 'account organisation category'
        }
      });
  });
})();
