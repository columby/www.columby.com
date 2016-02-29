'use strict';

var _             = require('lodash'),

    models        = require('../models/index'),

    config        = require('../config/config');



exports.update = function(req,res) {

};

exports.show = function(req,res) {

};


/**
 *
 * Delete an existing user.
 *
 *   Delete primary account
 *   Delete User
 *   Send email to user
 *
 **/
exports.delete = function(req, res) {
  // Todo
};


/**
 *
 * Error handler
 *
 **/
function handleError(res, err) {
  console.log('User Controller error:', err);
  return res.json({status: 'error', msg: err});
}
