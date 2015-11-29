'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var preprocess = require('gulp-preprocess');

var browserSync = require('browser-sync');

var plugins = require('gulp-load-plugins')();

gulp.task('scripts', ['constants'], function () {
  return gulp.src(path.join(conf.paths.src, '/www/app/**/*.js'))
    //.pipe(preprocess())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))

    .pipe(browserSync.reload({ stream: true }))
    // Display the size of the project
    .pipe(plugins.size());
});
