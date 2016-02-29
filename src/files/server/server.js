'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/config');
var logger = require('winston');

var app = express();

// Setup logging
require('./config/logger').logger(app);

var server = require('http').createServer(app);

require('./config/express')(app);
require('./models');
require('./routes')(app);

// Setup exeptionHandler logger. After all routes.
require('./config/logger').errorLogger(app);

server.listen(config.port, config.ip, function () {
  logger.debug('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
