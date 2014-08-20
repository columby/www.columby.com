'use strict';

angular.module('mean.columby')

/***
 * Controller for the metabar
 *
 ***/
.controller('MetabarController', ['$rootScope', '$scope', 'Global', 'Columby', 'MetabarSrv',
  function($rootScope, $scope, Global, Columby, MetabarSrv) {

    /*** INITIALISATION ***/
    $scope.editMode=false;


    /*** SCOPE FUNCTIONS ***/
    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

    $scope.edit = function(){
      $scope.editMode = !$scope.editMode;
      $rootScope.$broadcast('metabar::editMode', $scope.editMode);
    };

    
    /*** ROOTSCOPE EVENTS ***/
    // metadata received, set it in the scope
    $rootScope.$on('metabar::newMeta', function(evt, meta){
      // add ui-sref

      // add to scope
      $scope.postMeta = meta;
    });

    // Hide postMeta on a pagechange
    $rootScope.$on('$stateChangeStart', function (event, next) {
      $scope.postMeta = null;
    });

  }
])

;
