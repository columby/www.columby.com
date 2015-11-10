'use strict';

var models = require('../models/index'),
    Distribution = models.Distribution,
    User = models.User;


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
 * Check to see if a user can view a specific distribution
 *
 ***/
exports.canCreate = function(req,res,next){
  console.log('Checking canCreate for user id ' + req.jwt.sub);

  // check if dataset_id is provided
  if (!req.body.dataset_id) { return res.status(401).json({status: 'Error', msg: 'Missing parameter dataset_id'}); }
  // Check if user is in req
  if (!req.user || !req.user.email) { return res.json({ status:'error', msg:'No access.' }); }
  // Check if user is admin
  if (req.user.admin === true) { return next(); }

  validateAccountAccess(req.user, req.body.account_id,function(result){
    if (result===true){
      console.log('Yes access!');
      next();
    } else {
      console.log('No access!');
      return res.status(401).json({status: 'Error', msg: 'No access'});
    }
  });
}



/***
 *
 * Check to see if a user can view a specific distribution
 *
 ***/
exports.canEdit = function(req,res,next){
  console.log('Checking canEdit for distribution ' + req.params.id + ' for user id ' + req.jwt.sub);
  // user should be registered
  if (!req.jwt.sub) {
    return res.status(401).json({status: 'Error', msg: 'Not authorized'});
  }

  models.User.find({
    where: { id: req.jwt.sub},
    include: [
      { model: models.Account, as: 'account' }
    ]
  }).then(function(user){
      if (!user) { return res.status(401).json({status: 'Error', msg: 'No user found. '}); }
      models.Distribution.find({
        where:{ id:req.params.id },
        include: [{ model: models.Dataset, as: 'dataset' }]
      }).then(function(result){
        if (!result.dataset.dataValues.account_id) {
          return res.status(401).json({status: 'Error', msg: 'Account id not found for dataset. '});
        }
        if (user.account.indexOf(result.dataset.dataValues.account_id !== -1)){
          console.log('The user can edit this distribution! ');
          req.distribution = result.dataValues;
          next();
        } else {
          console.log('No access! ', user.Accounts);
          return res.status(401).json({status: 'Error', msg: 'No access'});
        }
      })
      .catch(function(err){
        console.log(err);
        return res.status(401).json({status: 'Error', msg: err});
      });
    }).catch(function(err){
      console.log(err);
      return res.status(401).json({status: 'Error', msg: err});
  });
}



/***
 *
 * Check to see if a user can view a specific distribution
 *
 ***/
exports.canDelete = function(req,res,next){
  console.log('Checking canDelete for distribution ' + req.params.id + ' for user id ' + req.jwt.sub);
  if (!req.jwt.sub) {
    return res.status(401).json({status: 'Error', msg: 'Not authorized'});
  }
  models.User.find({
    where: { id: req.jwt.sub},
    include: [
      { model: models.Account, as: 'account' }
    ]
  })
    .then(function(user){
      if (!user) { return res.status(401).json({status: 'Error', msg: 'No user found. '}); }
      // get account for dataset for Distribution
      models.Distribution.find({
        where:{
          id:req.params.id
        },
        include: [{ model: models.Dataset, as: 'dataset' }]

      })
        .then(function(result){
          if (!result.dataset.dataValues.account_id) {
            return res.status(401).json({status: 'Error', msg: 'Account id not found for dataset. '});
          }
          if (user.account.indexOf(result.dataset.dataValues.account_id !== -1)){
            console.log('The user can delete this distribution! ');
            req.distribution = result.dataValues;
            next();
          } else {
            console.log('No access! ', user.Accounts);
            return res.status(401).json({status: 'Error', msg: 'No access'});
          }
        })
        .catch(function(err){
          console.log(err);
          return res.status(401).json({status: 'Error', msg: err});
        })

    })
    .catch(function(err){
      console.log(err);
      return res.status(401).json({status: 'Error', msg: err});
    });
}
