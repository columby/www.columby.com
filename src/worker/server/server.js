'use strict';

/**
 * Main application file
 */


/***
 * Set default node environment to development
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


/**
 * Dependencies
 */
var express = require('express'),
  config = require('./config/config');


/**
 * Setup server
 */
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);

/**
 * Setup models
 */
require('./models/index');

/**
 * Setup routes
 */
require('./routes/index')(app);

// Setup the worker class
var Worker =require('./worker/worker');

/**
 * Start server
 */
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));

  console.log('Connecting worker.');
  var worker = new Worker(config, function(err){
    if (err) {
      console.log('err', err);
    } else {
      worker.start();
    }
  });

});

// Expose app
module.exports = app;
