'use strict';

angular.module('columbyApp')

  .controller('SiteNavCtrl', function ($rootScope, $scope) {

    /* ---------- SETUP ----------------------------------------------------------------------------- */


    function toggleSitenav(action) {
      switch (action){
        case 'close':
          $scope.showSitenav = false;
          $rootScope.showSitenav = false;
          break;
        case 'open':
          $scope.showSitenav = true;
          $rootScope.showSitenav = true;
          break;
        default:
          $scope.showSitenav = !$scope.showSitenav;
          $rootScope.showSitenav = !$rootScope.showSitenav;
      }
    }

    /* ---------- ROOTSCOPE EVENTS ------------------------------------------------------------------ */

    // State change
    $rootScope.$on('$stateChangeStart', function () {
      $rootScope.$broadcast('sitenav::toggle', 'close');
    });

    // Toggle sidebar
    $scope.$on('sitenav::toggle', function(event, action) {
      toggleSitenav(action);
    });


    /* ---------- SCOPE FUNCTIONS ------------------------------------------------------------------- */
    // function to send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function() {
      $rootScope.$broadcast('sitenav::toggle');
    };

  });
