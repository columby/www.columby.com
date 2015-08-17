'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var conf = require('./conf.js');
var path = require('path');

gulp.task('config', function () {
  var configPath = 'config/environment/' + process.env.NODE_ENV + '.config.json';
  console.log(configPath);
  console.log(path.join(conf.paths.src, '/config/environment'));

  return gulp.src(configPath)
    .pipe($.ngConstant())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')))
    .pipe(gulp.dest('src/app/'));
});
