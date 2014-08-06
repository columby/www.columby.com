'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Dataset = new Module('dataset');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Dataset.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Dataset.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Dataset.menus.add({
    title: 'dataset example page',
    link: 'dataset example page',
    roles: ['authenticated'],
    menu: 'main'
  });

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Dataset.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Dataset.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Dataset.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Dataset;
});
