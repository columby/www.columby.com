'use strict';

/**
 * Documentation tasks
 */

var gulp    = require('gulp');
var exec    = require('child_process').exec;

exports.apidoc = function (done) {
  exec('npm run apidoc', done);
};
