'use strict';

var models = require('../models/index'),
    authCtrl = require('../controllers/auth.controller'),
    config = require('../config/config'),
    jwt    = require('jwt-simple'),
    moment = require('moment');



// helper to check if a user has access to a certain account.
function validateAccountAccess(user, account_id, cb) {
  if (user.admin) { return cb(true); }

  if (user.primary.id === account_id) {
    return cb(true);
  }

  // Iterate over user's accounts
  for (var i=0; i<user.organisations.length; i++){
    // Check if account is same as requested account
    if (parseInt(user.organisations[ i].id) === parseInt(account_id)) {
      // Check if account has the right role to edit.
      // User account with role owner or admin can edit an account. (not editor or viewer)
      var roles = [1,2];
      if (roles.indexOf(user.organisations[ i].role) !== -1) {
        return cb(true);
      }
    }
  }

  return cb(false);
}


/***
 *
 * Check to see if a user can view a specific dataset
 *
 ***/
exports.canView = function(req,res,next){
  console.log('validating canview ', req.params);
  // Get the desired dataset
  models.Dataset.findOne({
    where: { shortid: req.params.id },
    include: [ { model: models.Account, as: 'account' }]
  }).then(function(dataset){
    req.dataset = dataset;
    if (!req.dataset.dataValues.private) {
      // public datasets are publicly visible
      next();
    } else {
      // Otherwise check access
      if (!req.user || !req.user.email) {
        // Get user from Token
        authCtrl.checkUser(req,res, function(){
          validateAccountAccess(req.user, dataset.dataValues.account_id, function(result){
            if (result) {
              next();
            } else {
              return res.json({status: 'error', result: null, msg: 'No access'});
            }
          })
        });
      } else {
        validateAccountAccess(req.user, dataset.dataValues.account_id, function(result){
          if (result) {
            next();
          } else {
            return res.json({result: null, msg: 'No access'});
          }
        });
      }
    }
  }).catch(function(err){
    console.log(err);
    return res.status(401).json({status: 'Error', msg: 'Error finding dataset: ' + req.params.id});
  });
}


/***
 *
 * Check to see if a user can create a specific dataset
 *
 ***/
exports.canCreate = function(req,res,next) {

  if (!req.body.account_id) { return res.status(401).json({status: 'Error', msg: 'Missing required parameter account_id'}); }

  // Check if user is in req
  if (!req.user || !req.user.email) {
    return res.json({ status:'error', msg:'No access.' });
  }

  // Check if user is admin
  if (req.user.admin === true) {
    return next();
  }

  validateAccountAccess(req.user, req.body.account_id, function(result){
    if (!result){ return res.status(401).json({status: 'Error', msg: 'No access'}); }
    next();
  });
}


/***
 *
 * Check to see if a user can edit a specific dataset
 *
 ***/
exports.canEdit = function(req,res,next){

  if (!req.params.id) {
    return res.json({status:'error', msg: 'Required parameter dataset id missing.'});
  }

  // Check if user is in req
  if (!req.user || !req.user.email) {
    return res.json({ status:'error', msg:'No access.' });
  }

  // Check if user is admin
  if (req.user.admin === true) {
    return next();
  }

  // Get the dataset's publication Account
  models.Dataset.findById(req.params.id, {
    include: [ { model: models.Account, as: 'account' }]
  }).then(function(dataset){
    req.dataset = dataset;
    validateAccountAccess(req.user, dataset.dataValues.account_id, function(result){
      console.log(result);
      if (!result) { return res.status(401).json({status: 'Error', msg: 'No user found'}); }
      // Valid
      return next();
    });
  }).catch(function(err){
    return res.status(401).json({status: 'Error', msg: JSON.stringify(err)});
  });
}


/***
 *
 * Check to see if a user can delete a specific dataset
 *
 ***/
exports.canDelete = function(req,res,next){
  if (!req.jwt || !req.jwt.sub) { return res.status(401).json({status: 'Error', msg: 'No access token provided'}); }
  if (!req.user || !req.user.id) { return res.status(401).json({status: 'Error', msg: 'No user found'}); }
  if (!req.params.id) { return res.json({status:'error', msg: 'Required parameter dataset id missing.'}); }

  // Get the dataset's publication Account
  models.Dataset.findById(req.params.id, {
    include: [ { model: models.Account, as: 'account' }]
  }).then(function(dataset){
    req.dataset = dataset;
    validateAccountAccess(req.user, dataset.dataValues.account_id, function(result){
      if (!result) {
        return res.status(401).json({status: 'Error', msg: 'No user found'});
      }
      return next();
    });
  }).catch(function(err){
    return res.status(401).json({status: 'Error', msg: JSON.stringify(err)});
  });
}
