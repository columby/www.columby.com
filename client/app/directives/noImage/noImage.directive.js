
'use strict';

/**
 *
 * Fallback for 404 img.
 *
 * http://alex-taran.blogspot.nl/2013/10/angular-js-no-image-directive.html
 *
 */

angular.module('columbyApp')

  .directive('noImage', function ($rootScope, $http, FileSrv) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        element.on('load',function() {
          console.log('load');
        }).on('error', function() {
          console.log('error loading image');
           //element.attr("src", "/lalabla.png");
          console.log(attrs.src);



          var originalSource = 'https://columby-dev.s3.amazonaws.com/undefined/small/unnamed-1.png';

          // Check if original file exists
          //$http.head(originalSource).success(function(result){
          //  console.log('res', result);
          //}).error(function(){
          //  console.log('there was an error getting the source image.');
          //});

          // request new image from embedly
          //var embedUrl = 'https://i.embed.ly/1/display/resize?key=' + $rootScope.config.embedly.key + '&url=' + originalSource + '&width=' + width
          FileSrv.createDerivative(originalSource).then(function(response){
            console.log(response);
          });

        });
      }
    };
  });
