'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Accounts = new Module('accounts');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Accounts.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Accounts.routes(app, auth, database);

	Accounts.aggregateAsset('css', 'collection.css');

  return Accounts;
});
