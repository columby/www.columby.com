'use strict';

angular.module('mean.columby')

/***
 * Controller for the metabar
 *
 ***/
.controller('MetabarController', ['$rootScope', '$scope', 'Columby', 'MetabarSrv',
  function($rootScope, $scope, Columby, MetabarSrv) {

    /*** INITIALISATION ***/
    $scope.editMode=false;


    /*** FUNCTIONS ***/
    function toggleEditMode(editMode){
      console.log('metabar editmode', editMode);
      $scope.editMode = editMode;

      if ($scope.editMode){
        angular.element('body').addClass('editMode');
      } else {
        angular.element('body').removeClass('editMode');
      }

      $rootScope.$broadcast('metabar::editMode', $scope.editMode);
    }


    /*** SCOPE FUNCTIONS ***/
    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function(e) {
      $rootScope.$broadcast('sitenav::toggle');
    };

    $scope.edit = function(){
      toggleEditMode(true);
    };



    /*** ROOTSCOPE EVENTS ***/
    // metadata received, set it in the scope
    $rootScope.$on('metabar::newMeta', function(evt, meta){
      // add ui-sref

      // add to scope
      $scope.postMeta = meta;
    });
    $scope.$on('editMode::false', function(evt){
      console.log('rootscope edit mode false');
      toggleEditMode(false);
    });

    // Hide postMeta on a pagechange
    $rootScope.$on('$stateChangeStart', function (event, next) {
      $scope.postMeta = null;
      angular.element('body').removeClass('editMode');
    });

  }
])

;
