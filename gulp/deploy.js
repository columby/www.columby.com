'use strict';

var conf = require('./conf');
var gulp = require('gulp');
var path = require('path');
var bump = require('gulp-bump');
var shell = require('gulp-shell');


// increase version number
gulp.task('bump', function(){
  return gulp.src(path.join(conf.paths.src, './../package.json'))
    .pipe(bump())
    .pipe(gulp.dest(path.join(conf.paths.src, './../')));
});

// Send build to remote host
gulp.task('ssh', function (callback) {
  var stream = gulp.src('')
    .pipe(shell(
      'scp -r ' + conf.paths.dist + '/* ' + conf.settings.sshHost + ':' + conf.settings.sshPath
    ));
  stream.on('end', callback);
  stream.resume();
});


gulp.task('deploy', ['bump','build','ssh:production']);
