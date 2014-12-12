
'use strict';

/**
 *
 * Fallback for 404 img.
 *
 * http://alex-taran.blogspot.nl/2013/10/angular-js-no-image-directive.html
 *
 */

angular.module('columbyApp')

.directive('backImg', function(){
  return function(scope, element, attrs){
    var url = attrs.backImg;
    console.log(url);
    element.css({
      'background-image': 'url(' + url +')',
      'background-size' : 'cover'
    });
  };
})

  .directive('noImage', function ($rootScope, $http, FileSrv) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        element.on('load',function() {
          //console.log('load');
        }).on('error', function() {
          console.log('No image directive: Error loading image: ', attrs.src);
          // Check if original file exists
          //$http.head(originalSource).success(function(result){
          //  console.log('res', result);
          //}).error(function(){
          //  console.log('there was an error getting the source image.');
          //});

          // request new image from embedly
          //var embedUrl = 'https://i.embed.ly/1/display/resize?key=' + $rootScope.config.embedly.key + '&url=' + originalSource + '&width=' + width
          // Request image from columby server
          FileSrv.createDerivative(attrs.src).then(function(response){
            console.log(response);
            attrs.source = response.url;
          });

        });
      }
    };
  });
