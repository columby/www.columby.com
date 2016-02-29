'use strict';

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var config = require('../config/config');

var options = {
  auth: {
    api_key: config.sendgrid.key
  }
};

var mailer = nodemailer.createTransport(sgTransport(options));

// Send an email
module.exports.sendMail = function(data, callback){
  var email = {
    to: data.to,
    from: data.from || 'hello@columby.com',
    subject: data.subject || 'Hello from Columby',
    text: data.text,
    html: data.html
  };

  mailer.sendMail(email, function(err,res){
    callback(err,res);
  });
};
