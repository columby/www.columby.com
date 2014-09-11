'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Columby = new Module('columby');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Columby.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Columby.routes(app, auth, database);

  Columby.angularDependencies(['growlNotifications', 'notifications']);

  Columby.aggregateAsset('css','fontello/fontello.css');
  Columby.aggregateAsset('css','fontello/animation.css');
  Columby.aggregateAsset('css','columby.css');
  Columby.aggregateAsset('css','editor-sidebar.css');

  if (process.env.NODE_ENV === 'development') {
    Columby.aggregateAsset('js', 'typekit.js');
  }

  return Columby;
});
