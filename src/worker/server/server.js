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
var Worker = require('./worker/worker');
var worker = new Worker(function(err){
  if (err) { console.log('Error starting the Worker, ', err); }
  console.log('Starting the Worker process. ')
  worker.start();
});

/**
 * Start server
 */
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
