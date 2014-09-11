'use strict';

/*
 * Defining the Package
 */
var mean = require('meanio'),
    Module = mean.Module;

var Access = new Module('access');

Access.register(function(database) {

  // Register auth dependency
  var auth = require('./server/config/authorization');

  // This is for backwards compatibility
  mean.register('auth', function() {
    return auth;
  });

  Access.middleware = auth;

  return Access;
});
