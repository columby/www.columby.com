'use strict';

var express = require('express');
var morgan = require('morgan');
var path = require('path');
var config = require('./config');
var cors = require('cors');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var compression = require('compression');

module.exports = function (app) {
  var env = app.get('env');

  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());

  app.use(cors());

  if (env === 'production') {
    app.use(morgan('common'));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
  }

  if ((env === 'development') || (env === 'test')) {
    app.use(require('connect-livereload')());
    app.use(morgan('dev'));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', path.join(config.root, 'client'));
  }
};
