'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Collection = new Module('collection');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Collection.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Collection.routes(app, auth, database);

  Collection.aggregateAsset('css', 'collection.css');

  return Collection;
});
