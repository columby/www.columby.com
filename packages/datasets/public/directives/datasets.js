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
        //var t = new Trianglify();
        //var pattern = t.generate(element.width(), element.height());
        //element[0].setAttribute('style', 'background-image: '+pattern.dataUrl);
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
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));

          read(); // initialize

        };

        element.bind('keydown', function(event) {
          // no enter
          if (attrs.htmlMode==='plain' && event.keyCode === 13) {
            //console.log('DONT');
            return false;
          } else if (event.keyCode === 13) {
            // Create paragraph instead of div
            document.execCommand('formatBlock', false, 'p');
          }
        });

        // Set the element's value in the scope when moving away from the element
        element.on('blur', function(){
          scope.$apply(read);
        });

        // Listen for change events to enable binding
        element.on('blur keyup change', function() {
          //scope.$apply(read);
        });

        // Write data to the model
        function read() {
          // get the type of element (input, div, etc)
          var html = element.html();

          // remove html for plain
          if (attrs.htmlformat === 'plain') {
            html=html.replace(/<br>/gi, '');
            html=html.replace(/<div>/gi, '');
            html=html.replace(/<\/div>/gi, '');
            html = html.replace(/(<([^>]+)>)/ig,'');
          }

          // When we clear the content editable the browser leaves a <br> behind
          // If strip-br attribute is provided then we strip this out
          if( attrs.stripBr && html === '<br>' ) {
            html = '';
          }
          ngModel.$setViewValue(html);
          element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));

        }
      }
    };
  }]
)

.directive('zenpeneditor', ['$rootScope', '$timeout', '$window', function ($rootScope, $timeout, $window) {

    var baseUrl = '/bower_components/',
    template = '<div class="{{zId}} section yin">' +
                  '<div class="ui">' +
                    '<div class="wrapper">' +
                      '<div class="top editing">' +
                        '<button class="color-flip useicons" title="Invert colors">&#xe002;</button>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="text-options">' +
                    '<div class="options">' +
                      '<span class="no-overflow">' +
                        '<span class="lengthen ui-inputs">' +
                          '<button class="url useicons">&#xe005;</button>' +
                          '<input class="url-input" type="text" placeholder="Type or Paste URL here"/>' +
                          '<button class="bold">b</button>' +
                          '<button class="italic">i</button>' +
                          '<button class="quote">&rdquo;</button>' +
                        '</span>' +
                      '</span>' +
                    '</div>' +
                  '</div>' +
                  '<article contenteditable="true" placeholder="{{ph}}" class="content">{{currentContent}}</article>' +
                  '<div class="word-counter">' +
                    '<span class="progress complete"></span>' +
                  '</div>' +
                '</div>';

    return {
      restrict : 'ACE',
      template : template,
      scope : {
        ngModel : '='
      },
      
      link : function(scope, element, attrs) {
        console.log('directive!');
        scope.baseUrl = scope.baseUrl || baseUrl;
        scope.currentContent = scope.ngModel;
        console.log('ngmodel', scope.ngModel);

        if ($window.zeditor) {
          console.log('window z-editor', $window.zeditor);
          $timeout(function() {
            new $window.zeditor({
              wrapperField : document.querySelector('.' + scope.zId),
              onKeyUp : function(html) {
                scope.ngModel = html;
                $rootScope.safeApply();
              }
            });
          }, 0);
        }

      }
    };
}])

;
