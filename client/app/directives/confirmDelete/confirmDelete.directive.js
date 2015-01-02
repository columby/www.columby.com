angular.module('columbyApp')

  .directive('confirmDelete', function($timeout) {

    return {
      replace: true,
      scope: {
        onConfirm: '&'
      },
      templateUrl: 'app/directives/confirmDelete/deleteConfirmation.html',

      link: function(scope,element,attrs){
        element.bind('mouseenter', function() {
          scope.hover=true;
        });
        element.parent().bind('mouseleave', function() {
          $timeout(function(){
            scope.$apply(function() {
              scope.hover = false;
              return scope.isDeleting = false;
            });
          }, 500);
        });
      },

      controller: function($scope, $timeout){

        $scope.isDeleting = false;

        $scope.startDelete = function() {
          $scope.isDeleting = true;
          // Set a timeout
          $timeout(function(){
            if ($scope.hover === false) {
              $scope.isDeleting = false;
            }
          }, 1500);
        };

        $scope.cancel = function() {
          $scope.isDeleting = false;
        };

        $scope.confirm = function() {
          $scope.onConfirm();
        };
      }
    }
  });
