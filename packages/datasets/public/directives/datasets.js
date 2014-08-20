'use strict';

angular.module('mean.datasets')


.directive('inline22', function () {
  return {
    template: '<span ng-switch on="edit" >' +
              '<span ng-switch-default>{{value}}<i class="icon-edit"></i>edit</span>' +
              '<input ng-switch-when="true" type="text" ng-model="$parent.value"/>' +
              '</span>',
    restrict: 'A',
    scope: {
      inline: '='
    },
    link: function (scope, element, attribs) {
      scope.value = scope.inline;
      console.log(scope.inline);
      /* watch for changes from the controller */
      scope.$watch('inline', function (val) {
        scope.value = val;
      });

      /* enable inline editing functionality */
      var enablingEditing = function () {
        scope.edit = true;

        setTimeout(function () {
          console.log(element.children().children('input'));
          element.children().children('input')[0].focus();
          element.children().children('input').bind('blur', function (e) {
            scope.$apply(function () {
              disablingEditing();
            });
          });
        }, 100);
      };


      /* disable inline editing functionality */
      var disablingEditing = function () {
        scope.edit = false;
        scope.inline = scope.value;
      };


      /* set up the default */
      disablingEditing();


      /* when the element with the inline attribute is clicked, enable editing */
      element.bind('click', function (e) {

        if ((e.target.nodeName.toLowerCase() === 'span') || (e.target.nodeName.toLowerCase() === 'img')) {
          scope.$apply(function () { // bind to scope
            enablingEditing();
          });
        }
      });

      /* allow editing to be disabled by pressing the enter key */
      element.bind('keypress', function (e) {

        if (e.target.nodeName.toLowerCase() !== 'input') return;

        var keyCode = (window.event) ? e.keyCode : e.which;

        if (keyCode === 13) {
          scope.$apply(function () { // bind scope
            disablingEditing();
          });
        }
      });
    }
  };
})


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
          if (attrs.nobreak && event.keyCode === 13) {
            //console.log('DONT');
            return false;
          }
        });

        // Set the element's value in the scope when moving away from the element
        element.on('blur', function(){
          scope.$apply(read);
        });

        // Listen for change events to enable binding
        element.on('blur keyup change', function() { //scope.$apply(read);
        });

        // Write data to the model
        function read() {
          // get the type of element (input, div, etc)
          var html = element.html();

          // remove html for plain
          if (attrs.htmlFormat === 'plain') {
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
);
