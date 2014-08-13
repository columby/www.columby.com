'use strict';

angular.module('mean.columby')

/***
 * Controller for the metabar
 *
 ***/
.controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby', 'MetabarSrv',
  function($rootScope, $scope, Global, Columby, MetabarSrv) {

    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

    // Show icon or not?
    $scope.showIcon = true;

    // Show post meta information
    $rootScope.$on('metabar::newMeta', function(evt, meta){
      console.log(evt);
      console.log(meta);
      console.log('setting postmeta to', meta);
      $scope.postMeta = meta;

    });

    // Hide postMeta on a pagechange
    $rootScope.$on('$stateChangeStart', function (event, next) {
      console.log('setting postmeta to null');
      $scope.postMeta = null;
    });

  }
])

;
