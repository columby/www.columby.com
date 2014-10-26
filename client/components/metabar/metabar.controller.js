'use strict';

angular.module('columbyApp')

  .controller('MetabarCtrl', function ($rootScope, $scope) {

    $scope.showSitenav = $rootScope.showSitenav;

    // $rootScope.$on('sitenav::toggle', function(evt, action) {
    //   console.log('s', action);
    //   $scope.showSitenav = !$scope.showSitenav;
    //   console.log('show sitenav: ', $scope.showSitenav);
    // });


    /* ----- SCOPE FUNCTIONS ---------------------------------------------------------- */
    // Send a message to the rootscope to toggle the sitenav
    $scope.toggleSiteNav = function() {
      $rootScope.$broadcast('sitenav::toggle');
    };

  });
