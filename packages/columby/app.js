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

  //We are adding a link to the main menu for all authenticated users
  Columby.menus.add({
    title: 'columby example page',
    link: 'columby example page',
    roles: ['authenticated'],
    menu: 'main'
  });

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Columby.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Columby.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Columby.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  Columby.angularDependencies(['xeditable']);

  Columby.aggregateAsset('css','fontello/fontello.css');
  Columby.aggregateAsset('css','fontello/animation.css');
  Columby.aggregateAsset('css','columby.css');
  if (process.env.NODE_ENV === 'development') {
      Columby.aggregateAsset('js', 'typekit.js');
  }

  return Columby;
});
