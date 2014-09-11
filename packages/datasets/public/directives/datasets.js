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
;
