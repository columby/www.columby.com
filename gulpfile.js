'use strict';

var gulp = require('gulp');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

gulp.task('default',    ['serve']);
gulp.task('serve',      ['watch'],  require('./tasks/serve').nodemon);
gulp.task('watch',      ['inject'],   require('./tasks/watch'));
gulp.task('inject',     ['less'],     require('./tasks/inject'));
gulp.task('less',                     require('./tasks/less'));
gulp.task('preview',    ['build'],    require('./tasks/preview'));
gulp.task('build',                    require('./tasks/build'));
gulp.task('bump',       ['version'],  require('./tasks/chore').bump);
gulp.task('version',                  require('./tasks/chore').version);
gulp.task('apidoc',                   require('./tasks/doc').apidoc);
