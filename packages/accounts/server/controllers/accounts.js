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

  if (!req.params.slug) {
    return res.json({err:'No slug provided'});
  } else {
    Account
      .findOne({slug: req.params.slug})
      .populate('datasets')
      .populate('collections', 'title description datasets')
      .exec(function(err, account) {
        console.log('a', account);
        return res.json({account:account} || {error:err});
      });
  }
};

/**
 * Update an account
 */
exports.update = function(req, res) {

  Account.findOne({ slug: req.body.slug }, function (err, account){
    if (err) {
      console.log(err);
    }
    if (!account) {
      console.log('no account');
    }
    if (account) {
      if (req.body.name) { account.name   = req.body.name; }
      if (req.body.description) { account.description   = req.body.description; }
      if (req.body.avatar) { account.avatar = req.body.avatar; }
      account.updatedAt = new Date();

      account.save(function(err){
        if (err) {
          return res.json({
            status: 'error',
            error: 'Error updating the account',
            err: err

          });
        } else {
          res.json(account);
        }
      });
    }
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
      return res.json(err);
    }

    return res.json(account);
  });
};
