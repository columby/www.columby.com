'use strict';

var gulp = require('gulp');
var conf = require('./conf');
var path = require('path');
var rename = require('gulp-rename');

gulp.task('constants', function () {
  console.log('env: ' + process.env.NODE_ENV);
  var configPath;
  if (process.env.NODE_ENV === 'production') {
    configPath = path.join(conf.paths.src, './config/production.constants.js');
  } else if (process.env.NODE_ENV === 'local') {
    configPath = path.join(conf.paths.src, './config/local.constants.js');
  } else {
    configPath = path.join(conf.paths.src, './config/development.constants.js');
  }
  console.log(configPath);
  return gulp.src(configPath)
    .pipe(rename('settings.js'))
    .pipe(gulp.dest(path.join(conf.paths.src, './app/')));
});
