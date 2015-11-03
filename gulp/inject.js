'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var plugins = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

// Inject files
gulp.task('inject', ['scripts', 'styles'], function () {


  var injectStyles = gulp.src([
    path.join(conf.paths.tmp, '/serve/app/**/*.css'),
    path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
  ], { read: false });

  var injectScripts = gulp.src([
    path.join(conf.paths.src, '/www/app/**/*.module.js'),
    path.join(conf.paths.src, '/www/app/**/*.js'),
    path.join('!' + conf.paths.src, '/www/app/**/*.spec.js'),
    path.join('!' + conf.paths.src, '/www/app/**/*.mock.js')
  ])
  .pipe(plugins.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

  var injectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp,'/serve')],
    addRootSlash: false
  };

  var scriptsInjectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp,'/serve')],
    addRootSlash: true,
    relative: true
  };

  return gulp.src(path.join(conf.paths.src, '/www/*.html'))
    // inject styles
    .pipe(plugins.inject(injectStyles, injectOptions))
    // inject scripts
    .pipe(plugins.inject(injectScripts, scriptsInjectOptions))
    // inject bower components
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
});
