
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

          // validate link
          var sourceUrl = attrs.src.split('/');
          console.log(sourceUrl);
          if ( (sourceUrl[0] !== 'https:') || (sourceUrl[1] !== '') ) {
            console.log('wrong image format. ');
            return;
          }

          // get desired size
          var size = sourceUrl[ sourceUrl.length -2];
          var width;
          console.log('size', size);
          var sizes={
            large:{
              width:800
            },
            medium:{
              width:400
            },
            small:{
              width:200
            },
            avatar:{
              width:80
            }
          };
          width = sizes[ size].width;

          // get filename
          var filename = sourceUrl[ sourceUrl.length -1];
          console.log(filename);

          // get account-i
          var accountId = sourceUrl[ sourceUrl.length -3];
          console.log('accountId', accountId);

          // create source url for request
          var originalSource = 'https://' + sourceUrl[ 2] + '/' + accountId + '/images/' + filename;
          console.log('originalSource', originalSource);

          originalSource = 'https://columby-dev.s3.amazonaws.com/undefined%2Funnamed-1.png';

          // Check if original file exists
          //$http.head(originalSource).success(function(result){
          //  console.log('res', result);
          //}).error(function(){
          //  console.log('there was an error getting the source image.');
          //});

          // request new image from embedly
          var embedUrl = 'https://i.embed.ly/1/display/resize?key=' + $rootScope.config.embedly.key + '&url=' + originalSource + '&width=' + width
          FileSrv.createDerivative(embedUrl).then(function(response){
            console.log(response);
          });

        });
      }
    };
  });
