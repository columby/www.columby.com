angular.module('columbyApp')

  .directive('confirmClick', function($timeout) {

    return {
      scope: {},

      link: function(scope,element,attrs){
        var actionText = element.text();
        var promise;

        scope.confirmAction = false;

        scope.$watch('confirmingAction', function (newVal, oldVal) {
          console.log('confirmAction', newVal, oldVal);
        });

        return element.bind('click', function () {
          console.log('click');
          if (!scope.confirmingAction) {
            scope.$apply(function () {
              return scope.confirmingAction = true;
            });
            return promise = $timeout(function () {
              return scope.confirmingAction = false;
            }, 1500);
          } else {
            if (hasConfirmed) {
              return;
            }
            hasConfirmed = true;
            $timeout.cancel(promise);
            element.css({ opacity: '0.5' });
            element.removeClass('confirming');
            return scope.$parent.$apply(attrs.confirmClick);
          }
        });
      }
    }
  });
