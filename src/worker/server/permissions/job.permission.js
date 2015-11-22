'use strict';

var models = require('../models/index');

// helper to check if a user has access to a certain account.
function validateAccountAccess(user, account_id, cb) {
  console.log('validate account access');
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


// Check if user can create
exports.canCreate = function(req,res,next){
  console.log('checking can create');
  console.log(req.user.email);
  // get user
  if (!req.user || !req.user.email) {
    console.log('No user');
    return res.status(400).json({status:'Unauthorized.'});
  }
  if (!req.body.data.dataset_id) {
    console.log('No dataset id');
    return res.status(401).json({status: 'Error', msg: 'Missing required parameter dataset_id'});
  }
  if (req.user.admin === true) { return next(); }
  // console.log(req.body.data);

  models.Dataset.findById(req.body.data.dataset_id).then(function(dataset){
    console.log('d', dataset.dataValues);
    if (!dataset) { return res.status(400).json({status:'error',msg:'No dataset found'}); }

    validateAccountAccess(req.user, dataset.dataValues.account_id, function(result){
      if (!result){ return res.status(401).json({status: 'Error', msg: 'No access'}); }
      next();
    });
  }).catch(function(err){
    console.log('e', err);
    return res.status(400).json({status:'error',msg:err});
  });
};
