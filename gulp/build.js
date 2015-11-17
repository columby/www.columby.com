'use strict';

var conf = require('./conf');
var path = require('path');
var gulp = require('gulp');
var gulpFilter = require('gulp-filter');

var plugins = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    path.join(conf.paths.src, '/www/app/**/*.html'),
    path.join(conf.paths.src, '/www/views/**/*.html'),
    path.join(conf.paths.tmp, '/www/serve/app/**/*.html')
  ])
  .pipe(plugins.minifyHtml({
    empty: true,
    spare: true,
    quotes: true
  }))
  .pipe(plugins.angularTemplatecache('templateCacheHtml.js', {
    module: 'columbyApp',
    root: 'views'
  }))
  .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = gulpFilter('*.html', {restore: true});
  var jsFilter = gulpFilter('**/*.js', {restore: true});
  var cssFilter = gulpFilter('**/*.css', {restore: true});
  var assets;

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe(plugins.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = plugins.useref.assets())
    .pipe(plugins.rev())
    .pipe(jsFilter)
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({ preserveComments: plugins.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe(plugins.replace('../../bower_components/bootstrap-sass-official/assets/fonts/bootstrap/', '../assets/fonts/'))
    .pipe(plugins.replace('../../bower_components/fontawesome/fonts', '../assets/fonts'))
    .pipe(plugins.csso())
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe(plugins.useref())
    .pipe(plugins.revReplace())
    .pipe(htmlFilter)
    .pipe(plugins.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/www')))
    .pipe(plugins.size({ title: conf.paths.dist, showFiles: true }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
  return gulp.src(path.join(conf.paths.src, '../bower_components/**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(plugins.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(plugins.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/www/assets/fonts/')));
});

gulp.task('other', function () {
  var fileFilter = plugins.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/www/app/settings.js'),
    path.join(conf.paths.src, '/www/favicon.ico'),
    path.join(conf.paths.src, '/www/robots.txt'),

  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist,'/www')));
});


gulp.task('api', function() {
  return gulp.src([
    path.join(conf.paths.src, '/api/server/**/*'),
    '!' + path.join(conf.paths.src, '/api/server/config/env.js')
  ])
  .pipe(gulp.dest(path.join(conf.paths.dist, '/api')));
});


gulp.task('files', function() {
  return gulp.src([
    path.join(conf.paths.src, '/files/server/**/*'),
    '!' + path.join(conf.paths.src, '/files/server/config/env.js')
  ])
  .pipe(gulp.dest(path.join(conf.paths.dist, '/files')));
});


gulp.task('worker', function() {
  return gulp.src([
    path.join(conf.paths.src, '/worker/server/**/*'),
    '!' + path.join(conf.paths.src, '/worker/server/config/env.js')
  ])
  .pipe(gulp.dest(path.join(conf.paths.dist, '/worker')));
});


gulp.task('clean', function (done) {
  plugins.del([conf.paths.dist, conf.paths.tmp], done);
});


gulp.task('build', ['html','fonts','other','api', 'files', 'worker']);
