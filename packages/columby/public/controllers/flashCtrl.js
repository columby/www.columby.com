'use strict';

angular.module('mean.columby')

.controller('FlashCtrl', ['$rootScope', '$scope', '$timeout', 'FlashSrv',
  function($rootScope, $scope, $timeout, FlashSrv) {


    /* ----- FUNCTIONS -----------------------------------------------------------------*/
    function closeMessage(){
      console.log('closing message');
      $scope.flashMessage = null;
    }

    /* ----- EVENTS ---------------------------------------------------------*/
    // Respond to flash messages
    $scope.$on('flashMessage::newMessage', function(e,msg){
      //console.log(e);
      //console.log(msg);
      $scope.flashMessage = msg;
      $timeout(closeMessage, 2000);
    });

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams){
      $scope.flashMessage = null;
      // check for queued messages
      FlashSrv.getMessage();
    });

  }
])

.controller('AddDynamicNotificationsExampleCtrl', ['$scope', function($scope){

    /**
     * Initialize index
     * @type {number}
     */
    var index = 0;

    /**
     * Boolean to show error if new notification is invalid
     * @type {boolean}
     */
    $scope.invalidNotification = false;

    /**
     * Placeholder for notifications
     *
     * We use a hash with auto incrementing key
     * so we can use "track by" in ng-repeat
     *
     * @type
     */
    $scope.notifications = {};

    /**
     * Add a notification
     *
     * @param notification
     */
    function add(notification){

      var i;

      if(!notification){
        $scope.invalidNotification = true;
        return;
      }

      i = index++;
      $scope.invalidNotification = false;
      $scope.notifications[i] = notification;
    }

    $scope.$on('addNotification', function(evt,msg){
      console.log('evt', evt);
      console.log('msg', msg);
      add(msg);
    });
  }])

;
