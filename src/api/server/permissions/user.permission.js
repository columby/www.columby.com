'use strict';

var models = require('../models/index');


/**
 *
 * Admins and user are allowed to show a full user account
 *
 **/
exports.canShow = function(req,res,next){
  // Check if user is in req
  if (!req.user || !req.user.email) {
    return res.json({ status:'err', msg:'No access.' });
  }
  // Check if user is admin
  if (req.user.admin === true) {
    return next();
  }
  // check if current user is requested slug
  else if (req.user.primary.slug === req.params.slug) {
    console.log('Permission granted');
    return next();
  } else {
    // All failed, no access
    return res.json({ status:'err', msg:'No access.' });
  }
}


/**
 *
 * Check if a user can edit a requested user account.
 *
 */
exports.canUpdate = function(req, res, next) {
  console.log('Check if user can edit this user account.');
  // Check if user is in req
  if (!req.user || !req.user.email) {
    return res.json({ status:'err', msg:'No access.' });
  }
  // Check if user is admin
  if (req.user.admin === true) {
    return next();
  }
  // check if current user is requested slug
  else if (req.user.primary.slug === req.params.slug) {
    console.log('Permission granted');
    return next();
  }
  // All failed, no access
  else {
    return res.json({ status:'err', msg:'No access.' });
  }
};


/**
 *
 * Check if a user can delete a requested user account.
 *
 */
exports.canDelete = function(req,res,next){

  // Check if user is in req
  if (!req.user || !req.user.email) {
    return res.json({ status:'err', msg:'No access.' });
  }
  // Check if user is admin
  if (req.user.admin === true) {
    return next();
  }
  // check if current user is requested slug
  else if (req.user.primary.slug === req.params.slug) {
    console.log('Permission granted');
    return next();
  }
  // All failed, no access
  else {
    return res.json({ status:'err', msg:'No access.' });
  }
}
