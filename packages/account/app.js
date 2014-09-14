'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Account = new Module('account');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Account.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Account.routes(app, auth, database);

  Account.angularDependencies(['toaster']);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Auth.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Auth.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Auth.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Account;
});
