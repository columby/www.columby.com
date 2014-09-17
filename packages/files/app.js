'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Files = new Module('files');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Files.register(function(app, auth, database) {

  Files.routes(app, auth, database);

  return Files;
});
