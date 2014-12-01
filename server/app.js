/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express'),
    Sequelize = require('sequelize'),
    config = require('./config/environment');


// Connect to the mongo database
//mongoose.connect(config.mongo.uri, config.mongo.options);
/**
 *
 * Database settings
 *
 **/
var sequelize = new Sequelize(config.db.uri, {
    dialect: config.db.dialect,
    logging: false,
    define: {
      underscored: true
    }
  }
);

/**
 *
 * Authenticate to the database
 *
 **/
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Postgres; Connection has been established successfully.')
    }
  });

// Populate DB with sample data
//if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);

var models = require('./models');
var routes = require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
