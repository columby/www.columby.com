'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var preprocess = require('gulp-preprocess');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

gulp.task('scripts', ['constants'], function () {
  return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
    .pipe(preprocess())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe($.size());
});
