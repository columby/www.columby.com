'use strict';

angular.module('mean.datasets')

.directive('triangle', function ($timeout) {

  return {
    //restrict: 'E',
    scope: {
      val: '=',
      grouped: '='
    },
    link: function (scope, element, attrs) {
      // Using timout to start this after rendering.
      $timeout(function(){
        var t = new Trianglify();
        var pattern = t.generate(element.width(), element.height());
        element[0].setAttribute('style', 'background-image: '+pattern.dataUrl);
      },100);
    }
  };
})

// https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
// https://github.com/jakiestfu/Medium.js
.directive('contenteditable', ['$sce', function($sce) {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, element, attrs, ngModel) {
        if(!ngModel) return; // do nothing if no ng-model

        // Specify how UI should be updated
        ngModel.$render = function() {
          console.log(ngModel);
          console.log(ngModel.$viewValue);
          element.html($sce.trustAsHtml(ngModel.$viewValue || ''));
        };

        element.bind('keydown', function(event) {
          // no enter
          if (attrs.stripB && event.keyCode === 13) {
            return false;
          }
        });

        // Hide the placeholder for this element when selected.
        element.on('focus', function(){
          element.parent().parent().find('.editable-placeholder').hide();
        });

        // Sow the placeholder for this element when deselected.
        element.on('blur', function(){
          element.parent().parent().find('.editable-placeholder').show();
        });

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          scope.$apply(read);
        });

        // Write data to the model
        function read() {
          var html = element.html();
          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if( attrs.stripBr && html === '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
        }

        read(); // initialize
      }
    };
  }]
);
