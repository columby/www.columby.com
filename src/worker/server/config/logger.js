'use strict';

// dependencies
var config = require('./config');
var expressWinston = require('express-winston');
var util = require('util');
var mailService = require('./../services/mail.service');
var winston = require('winston');

// Log file directory. Currently not in use because pm2 handles file-based logging.
var logDir = config.root + '/logs';


// Create a Winston logger transporter that sends an email using sendgrid.
var SendGridLogger = winston.transports.SendGridLogger = function (options) {
  options = options || {};
  if (!options.to){
    throw new Error('winston-mail requires \'to\' property');
  }
  this.name = 'sendGridLogger';
  this.level = options.level || 'info';

  this.to = options.to || 'admin@columby.com';
  this.from = options.from || 'admin@columby.com';
  this.subject = options.subject || 'Message from Columby worker';
  this.html = options.html || 'Content missing';
};

util.inherits(SendGridLogger, winston.Transport);

SendGridLogger.prototype.log = function (level, msg, meta, callback) {
  var self = this;
  console.log('new sendgrid logger');
  mailService.sendMail({
    to: this.to,
    from: this.from,
    subject: this.subject,
    html: 'Error: ' + level + '<br>Message: ' + msg + '<br>Meta: <pre>' + JSON.stringify(meta) + '</pre>'
  }, function(err) {
    callback(null, true);
  });
};

// initiate the winston logger
winston.setLevels({
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
});
winston.addColors({
  error: 'red',
  warn:  'yellow',
  info:  'cyan',
  debug: 'magenta',
  verbose: 'green',
  silly: 'green',
});
winston.remove(winston.transports.Console);
// Log all messages to the console.
winston.add(winston.transports.Console, {
  level: 'silly',
  colorize:true
});
// Send errors by email to the admin
winston.add(winston.transports.SendGridLogger, {
  to: 'admin@columby.com',
  subject: 'Columby worker error message',
  level: 'error'
});


// Create the express winston logger
exports.expressLogger = function(app) {
  app.use(expressWinston.winston({
    statusLevels: true,
    colorStatus: true,
    winstonInstance: winston
  }));
};


// Error exception handler. Sends a mail to sysadmin.
exports.errorLogger = function(app) {
  app.use(expressWinston.errorLogger({
    // winstonInstance: winston,
    transports: [
      new winston.transports.SendGridLogger({
        to: 'admin@columby.com',
        subject: 'Columby worker error report: Uncaught exception handler'
      })
    ]
  }));
};

// Make the winston logger available
exports.logger = function() {
  return winston;
};
