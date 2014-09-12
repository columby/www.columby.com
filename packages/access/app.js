'use strict';

/*
 * Defining the Package
 */
var mean = require('meanio'),
  Module = mean.Module;

var Access = new Module('access');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Access.register(function(database) {

  //We enable routing. By default the Package Object is passed to the routes
  //Access.routes(app, database);

  // Register auth dependency
  var auth = require('./server/config/authorization');

  //Access.routes(app, database);

  // This is for backwards compatibility
  mean.register('auth', function() {
    return auth;
  });

  Access.middleware = auth;

  return Access;
});
