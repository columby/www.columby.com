'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module,
    favicon = require('serve-favicon')
;

var Columby = new Module('columby');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Columby.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Columby.routes(app, auth, database);

  Columby.aggregateAsset('css','fontello/fontello.css');
  Columby.aggregateAsset('css','fontello/animation.css');
  Columby.aggregateAsset('css','columby.css');
  Columby.aggregateAsset('css','editor-sidebar.css');
  Columby.aggregateAsset('css','search.css');
  Columby.aggregateAsset('css','notices.css');
  Columby.aggregateAsset('css','elements.css');

  Columby.angularDependencies(['elasticsearch', 'angular-loading-bar','ngAnimate', 'toaster', 'ngDialog']);

  // Setting the favicon and static folder
  app.use(favicon(__dirname + '/public/assets/img/favicon.png'));

  /*
  if (process.env.NODE_ENV === 'development') {
    Columby.aggregateAsset('js', 'typekit.js');
  }
*/
  return Columby;
});
