'use strict';

var gulp = require('gulp');
var conf = require('./conf');
var path = require('path');

// Add environment specific angular constants.
gulp.task('constants', function() {

  // Get environment variable
  var env = process.env.NODE_ENV;
  if ( (env !== 'production') || (env !== 'local')) { env = 'development'; }

  // Add version to constants
  var data = require('./../package.json');
  var constants = require(path.join('./../src/www/config/' + env + '.constants.json'));
  constants.version = data.appVersion;

  // Create string for file
  var content = '(function(){ \n' +
    '  \'use strict\';\n' +
    '  angular.module(\'columbyApp\').constant(\'appConstants\', \n' +
    '  ' + JSON.stringify(constants) + '\n' +
    ' ); \n' +
    '})();';

  // Save file
  require('fs').writeFileSync(path.join(conf.paths.src, 'www/app/index.constants.js'), content);

});
