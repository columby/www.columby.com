'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

var util = require('util');

var proxyMiddleware = require('http-proxy-middleware');

function browserSyncInit(baseDir, browser) {
  browser = browser === undefined ? 'default' : browser;

  var routes = null;
  if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src + '/www') !== -1)) {
    routes = {
      '/bower_components': 'bower_components'
    };
  }

  var server = {
    baseDir: baseDir,
    routes: routes
  };

  /*
   * You can add a proxy to your backend by uncommenting the line bellow.
   * You just have to configure a context which will we redirected and the target url.
   * Example: $http.get('/users') requests will be automatically proxified.
   *
   * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
   */
  // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});

  browserSync.instance = browserSync.init({
    startPath: '/',
    server: server,
    browser: browser,
    port: 9000
  });
}

browserSync.use(browserSyncSpa({
  selector: '[ng-app]'// Only needed for angular apps
}));

gulp.task('serve', ['watch'], function () {
  browserSyncInit([path.join(conf.paths.tmp, '/serve'), path.join(conf.paths.src, '/www')]);
});

gulp.task('serve:dist', ['build'], function () {
  browserSyncInit(path.join(conf.paths.dist, '/www'));
});

gulp.task('serve:e2e', ['inject'], function () {
  browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src], []);
});

gulp.task('serve:e2e-dist', ['build'], function () {
  browserSyncInit(conf.paths.dist, []);
});

// 'use strict';
//
// var path = require('path');
// var gulp = require('gulp');
// var conf = require('./conf');
//
// var browserSync = require('browser-sync');
// var browserSyncSpa = require('browser-sync-spa');
// var less = require('gulp-less');
// var plugins = require('gulp-load-plugins')();
// var wiredep = require('wiredep').stream;
// var bowerFiles = require('main-bower-files');
// var inject = require('gulp-inject');
//
// gulp.task('serve2', ['inject-bower','inject-css'], function(){
//   //var baseDir= [path.join(conf.paths.tmp, '/serve'), path.join(conf.paths.src + '/www')];
//   // var baseDir= path.join(conf.paths.src + '/www');
//   var bs1 = browserSync.create('www'); // Create a named instance
//   var bs2 = browserSync.create('api'); // Create a second named instance
//
//   browserSync.use(browserSyncSpa({
//     selector: '[ng-app]'// Only needed for angular apps
//   }));
//
//   bs1.init({
//     startPath: '/',
//     server: {
//       baseDir: path.join(conf.paths.src + '/www')
//     },
//     // browser: browser,
//     port: 9100,
//     //proxy: conf.paths.src + '/www',
//     ui: {
//       port: 9101
//     }
//   });
//
//   //bs1.use(require("some-plugin")); // Add a plugin to first instance only
//
//   // browserSyncInit([
//   //   path.join(conf.paths.tmp, '/serve'), path.join(conf.paths.src + '/www')]
//   // );
//
//   // bs1.init({
//   //   startPath: '/',
//   //     port: 8000,
//   //     server: conf.paths.src,
//   //     ui: {
//   //       port: 8001
//   //   }
//   // });
//   // var browser = browser === undefined ? 'default' : browser;
//   //
//   // var routes = null;
//   // if(baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
//   //   routes = {
//   //     '/bower_components': 'bower_components'
//   //   };
//   // }
//
//
// });
//
//
// // var util = require('util');
// //
// // var proxyMiddleware = require('http-proxy-middleware');
//
//
//
//
//
//
//
//
// // function browserSyncInit(baseDir, browser) {
// //   browser = browser === undefined ? 'default' : browser;
// //
// //   var routes = null;
// //   if(baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
// //     routes = {
// //       '/bower_components': 'bower_components'
// //     };
// //   }
// //
// //   var server = {
// //     baseDir: baseDir,
// //     routes: routes
// //   };
// //
// //   /*
// //    * You can add a proxy to your backend by uncommenting the line bellow.
// //    * You just have to configure a context which will we redirected and the target url.
// //    * Example: $http.get('/users') requests will be automatically proxified.
// //    *
// //    * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.0.5/README.md
// //    */
// //   // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', proxyHost: 'jsonplaceholder.typicode.com'});
// //
// //   browserSync.instance = browserSync.init({
// //     startPath: '/',
// //     server: server,
// //     browser: browser,
// //     port: 9000
// //   });
// // }
//
// // gulp.task('serve', ['watch'], function () {
// //   browserSyncInit([path.join(conf.paths.tmp, '/serve'), path.join(conf.paths.src + '/www')]);
// // });
//
// // gulp.task('serve:dist', ['build'], function () {
// //   browserSyncInit(conf.paths.dist);
// // });
//
// // gulp.task('serve:e2e', ['inject'], function () {
// //   browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src], []);
// // });
// //
// // gulp.task('serve:e2e-dist', ['build'], function () {
// //   browserSyncInit(conf.paths.dist, []);
// // });
//
//
//
// // Compile sass into CSS & auto-inject into browsers
// gulp.task('less', function() {
//   return gulp.src(conf.paths.src + '/www/assets/styles/style.less')
//       .pipe(less())
//       .pipe(gulp.dest(path.join(conf.paths.src, '/www/assets/styles')))
//       .pipe(browserSync.stream());
// });
//
// gulp.task('inject-css', function(){
//   var injectFiles = gulp.src([
//     path.join(conf.paths.src, '/www/assets/styles/**/*.less'),
//     path.join(conf.paths.src, '/www/app/**/*.less'),
//     path.join('!' + conf.paths.src, '/www/assets/styles/style.less')
//   ], { read: false });
//
//   var injectOptions = {
//     transform: function(filePath) {
//       //filePath = filePath.replace(conf.paths.src + '/app/', '');
//       return '@import "' + filePath + '";';
//     },
//     starttag: '// injector',
//     endtag: '// endinjector',
//     addRootSlash: false
//   };
//
//   return gulp.src([path.join(conf.paths.src, '/www/assets/styles/style.less')])
//     .pipe(plugins.inject(injectFiles, injectOptions))
//     .pipe(wiredep({
//       exclude: [/bootstrap.js$/, /bootstrap-sass-official\/.*\.js/, /bootstrap\.css/],
//       directory: 'bower_components'
//     }))
//     .pipe(plugins.sourcemaps.init())
//     .pipe(plugins.less())
//     .pipe(plugins.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
//     .pipe(plugins.sourcemaps.write())
//     .pipe(gulp.dest(path.join(conf.paths.src, '/www/assets/styles')))
//     .pipe(browserSync.reload({stream:true}));
// });
//
// gulp.task('inject-bower', function(){
//   console.log(path.join(conf.paths.src, 'www/index.html'));
//   gulp.src(path.join(conf.paths.src, 'www/index.html'))
//   .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}));
// });
