'use strict';

/**
 *
 * Fallback for 404 img.
 *
 * http://alex-taran.blogspot.nl/2013/10/angular-js-no-image-directive.html
 *
 */

angular.module('columbyApp')

  .directive('noImage', function () {

    console.log('no image');

    var setDefaultImage = function (el) {
      console.log('checkchekc');
      //el.attr('src', 'some.jpg');
    };

    return {
      restrict: 'A',
      link: function (scope, el, attr) {
        //scope.$watch(function() {
        //  return attr.ngSrc;
        //}, function () {
        //  var src = attr.ngSrc;
        //
        //  if (!src) {
        //    setDefaultImage(el);
        //  }
        //});

        el.bind('error', function() { setDefaultImage(el); });
      }
    };
  });
