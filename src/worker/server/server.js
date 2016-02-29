'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


// Dependencies
var express = require('express');
var config = require('./config/config');
var app = express();
var logger = require('winston');

// Setup logging
require('./config/logger').logger(app);


// Create server
var server = require('http').createServer(app);
require('./config/express')(app);

// Setup models
require('./models/index');

// Setup routes
require('./routes/index')(app);

// Setup exeptionHandler logger. After all routes.
require('./config/logger').errorLogger(app);

// Setup the worker class
var Worker = require('./worker/worker');
var worker = new Worker(function(err){
  if (err) { console.log('Error starting the Worker, ', err); }
  logger.debug('Starting the Worker process. ');
  worker.start();
});

/**
 * Start server
 */
server.listen(config.port, config.ip, function () {
  logger.debug('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
