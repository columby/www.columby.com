/************************
 *
 * Permission to check if a given user has permission
 * for primary sources (distributions)
 *
 ************************/

'use strict';

var models = require('../models/index'),
    Distribution = models.Distribution,
    config = require('./../config/config');
var logger = require('winston');

// helper to check if a user has access to a certain account.
function validateAccountAccess(user, account_id, cb) {

  if (user.admin) { return cb(true); }

  // Check if the given account id is the current user's primary account
  if (user.primary.id === account_id) {
    console.log('The given account id is the current users primary account, access granted.');
    return cb(true);
  }

  // Check if the given account id is one of the user's publication accounts
  console.log('Validating if account id ' + account_id + ' is one of the user publication accounts.');
  for (var i=0; i<user.organisations.length; i++){
    // Check if account is same as requested account
    if (parseInt(user.organisations[ i].id) === parseInt(account_id)) {
      // Check if account has the right role to edit.
      // User account with role owner, admin or editor  can edit the primary source for an account.
      var roles = [1,2,3];
      if (roles.indexOf(user.organisations[ i].role) !== -1) {
        console.log('The current user can edit the primary source for the given account. ');
        return cb(true);
      }
    }
  }
  return cb(false);
}


 /**
  *
  * Validate if a logged in user can create a new primary source
  * for a distribution in a dataset
  *
  **/
exports.canCreate = function(req,res,next){
   console.log('Checking can create primary');
   console.log(req.body);

   // check if dataset_id is provided
   if (!req.body.dataset_id) { return res.status(401).json({status: 'Error', msg: 'Missing parameter dataset_id.'}); }
   if (!req.body.distribution_id) { return res.status(401).json({status: 'Error', msg: 'Missing parameter distribution_id.'}); }
   // Check if user is in req
   if (!req.user || !req.user.email) { return res.json({ status:'error', msg:'No access. Not logged in.' }); }
   // Check if user is admin
   if (req.user.admin === true) { return next(); }


   // provided: dataset_id and distribution_id
   // Distribution has dataset_id
   // Validate if the curent user can edit the dataset of the new primary
   models.Distribution.findById(req.body.distribution_id, {
     include: [{ model: models.Dataset, as: 'dataset'}]
   }).then(function(result){
    if (result && result.dataValues && result.dataValues.dataset && result.dataValues.dataset.dataValues) {
      var account_id = result.dataValues.dataset.dataValues.account_id;
      console.log('Validating account access for account: ' + account_id);
      validateAccountAccess(req.user, account_id, function(result){
        if (result===true){
          console.log('User has access to account ' + account_id);
          next();
        } else {
          console.log('User has NO access to account ' + account_id);
          return res.status(401).json({status: 'Error', msg: 'No access'});
        }
      });
    } else {
      return res.status(401).json({status: 'Error', msg: 'No access'});
    }
   }).catch(function(err){
     return res.status(401).json({status: 'Error', msg: err});
   });

};


/**
 *
 * Validate if a logged in user can update a given primary source.
 *
 **/
exports.canUpdate = function(req,res,next) {
  console.log('Checking canUpdate for user for distribution ' + req.params.id);

  // check if dataset_id is provided
  if (!parseInt(req.params.id)) {
    console.log('Missing parameter id');
    return res.status(401).json({status: 'Error', msg: 'Missing parameter id'});
  }
  // check if dataset_id is provided
  // if (!req.body.dataset_id) {
  //   console.log('Missing parameter dataset_id');
  //   return res.status(401).json({status: 'Error', msg: 'Missing parameter dataset_id'});
  // }

  // Check if user is in req
  if (!req.user || !req.user.email) {
    console.log('No authenticated user found');
    return res.json({ status:'error', msg:'No access.' });
  }
  // Check if user is admin
  if (req.user.admin === true) {
    console.log('User is admin');
    return next();
  }

  // get dataset and account for the given primary source
  models.Primary.findById(req.params.id, {
    include: [
      { model: models.Dataset, as: 'dataset', include: [
        { model: models.Account, as: 'account' }
      ]}
    ]
  }).then(function(result) {
    if (!result) { return res.status(401).json({status: 'Error', msg: 'No primary found'}); }

    var account_id = result.dataValues.dataset.dataValues.account_id;
    console.log(account_id);
    console.log('Validating if user can access account id: ' + account_id);
    validateAccountAccess(req.user, account_id, function(result) {
      console.log('Validate account access result: ' + result);
      if (!result) { return res.status(401).json({status: 'Error', msg: 'No access'}); }
      console.log('Can edit TRUE');
      return next();
    });
  }).catch(function(err){
    console.log(err);
    return res.status(401).json({status: 'Error', msg: err});
  });
};


/**
 *
 * Delete a Primary source
 *
 **/
exports.canDelete = function(req, res, next) {
  logger.debug('Checking canDelete for primary ' + req.params.id);

  // check if dataset_id is provided
  if (!req.params.id) { return res.status(401).json({status: 'Error', msg: 'Missing parameter id'}); }
  // Check if user is in req
  if (!req.user || !req.user.email) {
    logger.debug('User is not logged in.');
    return res.json({ status:'error', msg:'No access.' });
  }
  // Check if user is admin
  if (req.user.admin === true) { return next(); }
  logger.debug('Fetching primary source');
  // Get the primary from the database, include the source's dataset
  models.Primary.findById(req.params.id, {
    include: [
      { model: models.Dataset, as: 'dataset' }
    ]
  }).then(function(result) {
    if (!result) {
      logger.debug('Primary not found');
      return res.status(401).json({status: 'Error', msg: 'Primary not found'});
    }
    // add the distribution to the req.
    req.distribution = result;
    // // Check if the current user is allowed to edit the provided publication account.
    validateAccountAccess(req.user, result.dataValues.dataset.dataValues.account_id, function(result){
      if (!result) { return res.status(401).json({ status: 'Error', msg: 'No access for this account' }); }
      logger.debug('User can delete this Primary. ');
      return next();
    });
  }).catch(function(err){
    return res.status(401).json({status: 'Error', msg: err});
  });
};


// Make sure only a local connection can create a file from a table.
// Todo: make this better.
exports.canConvert = function(req, res, next) {
  console.log('environment: ' + config.environment);
  console.log('remote address: ' + req.connection.remoteAddress);
  if (config.environment === 'development') {
    next();
  } else if (config.environment === 'production') {
    if (req.connection.remoteAddress !== '127.0.0.1') {
      res.json({ status: 'error', msg: 'Only local connections allowed, not ' + req.connection.remoteAddress});
    } else {
      next();
    }
  } else {
    res.json({status: 'error', msg: 'No environment specified'});
  }
};
