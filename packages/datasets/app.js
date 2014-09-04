'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Datasets = new Module('datasets');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Datasets.register(function(app, auth, database) {

  Datasets.routes(app, auth, database);

  Datasets.aggregateAsset('css','datasets.css');

  Datasets.angularDependencies(['textAngular']);

  return Datasets;
});
