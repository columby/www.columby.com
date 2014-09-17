'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Account = mongoose.model('Account')
;

/**
 * Send logged in Account account
 */
exports.account = function(req, res) {

  Account.findOne({slug: req.params.slug}, function(err, account){
    return res.json(account || err);
  });
};


exports.update = function(req, res) {
  var id = req.body.update.id ;
  console.log('id', id);

  var update = { $set: req.body.update.account };
  console.log('update', update);

  Account.update({_id: id}, update, function(err, account){
    console.log('error', err);
    console.log('account', account);
    if (err) return res.json({
      status:'error',
      err: err
      });
    if (account === 0) {
      return res.json({
        status: 'error',
        err: 'No account updated'
      });
    }
    return res.json({
      status: 'success',
      statusMessage: 'Account updated'
    });
  });
};


/**
 * List of Datasets
 */
exports.index = function(req, res) {
  var filter = {};
  if (req.query.id) { filter._id = req.query.userId; }
  if (req.query.owner) { filter.owner = req.query.owner; }
  if (req.query.primary) { filter.primary = req.query.primary; }

  console.log('filter', filter);

  Account
    .find(filter)
    .sort('primary')
    .exec(function(err, accounts) {
      if (err) { return res.json(500, { error: 'Cannot list the accounts' }); }

      return res.json(accounts);
    })
  ;
};
/**
 * Create account
 */
exports.create = function(req, res, next) {
  console.log('account check', req.body);

  var account = new Account(req.body);
  account.save(function(err) {
    console.log('account after save', account);
    if (err) {
      console.log('Saving account error:', err);
    }
  });
};
