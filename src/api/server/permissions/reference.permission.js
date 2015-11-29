'use strict';

var models = require('../models/index'),
    authCtrl = require('../controllers/auth.controller'),
    config = require('../config/config');



// Fetch a specific dataset
function getDataset(id, cb){
  models.Dataset.findById(id).then(function(dataset){
    cb(dataset);
  }).catch(function(err){
    cb(null,err);
  })
}


exports.canCreate = function(req,res,next) {

  console.log('validating reference.canCreate');

  // check if dataset_id is provided
  if (!req.body.dataset_id) { return res.status(401).json({status: 'Error', msg: 'Missing parameter dataset_id'}); }
  // Check if user is in req
  if (!req.user || !req.user.email) { return res.json({ status:'error', msg:'No access.' }); }
  // Check if user is admin
  if (req.user.admin === true) { return next(); }

  // get dataset and publication account
  getDataset(req.body.dataset_id, function(dataset, err){
    if (err) { return res.status(401).json({status: 'Error', msg: 'Error', err: err }); }
    if (!dataset) { return res.status(401).json({status: 'Error', msg: 'No dataset found'}); }

    // Iterate over user's accounts and check if user can edit the dataset
    if (req.user.primary.id === dataset.account_id) { return next(); }

    for (var i=0; i<req.user.organisations.length; i++){
      // Check if account is same as requested publication account for the new reference.
      if (req.user.organisations[ i].id === dataset.account_id) {
        // Check if account has the right role to edit.
        var role = req.user.organisations[ i].role;
        var roles = [1,2,3];
        // User account with role owner, admin can edit an account. (Not editor or viewer)
        if (roles.indexOf(role) !== -1) {
          return next();
        }
      }
    }
    // All failed, no access :(
    console.log('All failed, no access.');
    return res.status(401).json({status: 'Error', msg: 'No access'});
  });
}


exports.canUpdate = function(req,res,next){
  console.log('validating reference.canUpdate');
  // check if dataset_id is provided
  if (!req.params.id) { return res.json({status: 'error', msg: 'Missing parameter id'}); }
  // Check if user is in req
  if (!req.user || !req.user.email) { return res.json({ status:'error', msg:'No access.' }); }
  // Check if user is admin
  if (req.user.admin === true) { return next(); }

  // Get the reference and dataset it belongs to
  models.Reference.findById(req.params.id, {
    include: [ { model: models.Dataset, as: 'Dataset' } ]
  }).then(function(reference){
    if (!reference){
      return res.json({status:'error',msg:'No reference found'});
    }
    // Get account_id of dataset owner
    var referenceAccountId = reference.dataValues.Dataset.dataValues.account_id;
    // Primary account has access
    if (req.user.primary.id === referenceAccountId){ return next(); }
    // Iterate over user's accounts
    for (var i=0; i<req.user.organisations.length; i++){
      // Check if account is same as requested publication account for the new reference.
      if (req.user.organisations[ i].id === referenceAccountId) {
        console.log('Account found for user, checking role');
        // Check if account has the right role to edit.
        var role = req.user.organisations[ i].role;
        var roles = [1,2,3];
        if (roles.indexOf(role) !== -1) {
          return next();
        }
      }
    }
    // Otherwise no access
    return res.json({ status:'err', msg:'No access.' });
  }).catch(function(err){
    console.log('db error ', err);
    return res.json({status: 'Error', msg: err});
  });
}


exports.canDelete = function(req,res,next){
  console.log('Validating reference.canDelete for reference: ' + req.params.id);

  // check if dataset_id is provided
  if (!req.params.id) { return res.json({status: 'error', msg: 'Missing parameter id'}); }
  // Check if user is in req
  if (!req.user || !req.user.email) { return res.json({ status:'error', msg:'No access.' }); }
  // Check if user is admin
  if (req.user.admin === true) { return next(); }

  // Fetch reference and related dataset.
  models.Reference.findById(req.params.id, {
    include: [ { model: models.Dataset, as: 'Dataset' } ]
  }).then(function(reference){
    if (!reference) { return res.json({status:'error',msg:'No reference found'}); }
    // Get the account who owns the dataset
    var referenceAccountId = reference.dataValues.Dataset.dataValues.account_id;
    // Check if user owns the dataset with its primary account
    if (req.user.primary.id === referenceAccountId){ return next(); }
    // Iterate over user's accounts
    for (var i=0; i<req.user.organisations.length; i++){
      // Check if account is same as requested publication account for the new reference.
      if (req.user.organisations[ i].id === referenceAccountId) {
        // Check if account has the right role to edit.
        var role = req.user.organisations[ i].role;
        var roles = [1,2,3];
        // User account with role owner, admin can edit an account. (Not editor or viewer)
        if (roles.indexOf(role) !== -1) {
          return next();
        }
      }
    }
    // Otherwise no access
    return res.json({ status:'error', msg:'No access.' });
  }).catch(function(err){
    console.log('db error ', err);
    return res.json({status: 'error', msg: err});
  });
}
