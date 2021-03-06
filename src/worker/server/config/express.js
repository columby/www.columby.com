/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var auth = require('http-auth');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./config');
var cors = require('cors');
var authCtrl = require('../controllers/auth.controller');


module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/client');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());

  app.use(cors());

  //app.use(express.static(__dirname + '/public'));
  app.use(express.static(path.join(config.root, 'client')));

  if ('production' === env) {
    app.set('appPath', config.root + '/client');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};
