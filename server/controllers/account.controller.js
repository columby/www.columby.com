'use strict';

/**
 *
 * Dependencies
 *
 */
var _ = require('lodash'),
    Sequelize = require('sequelize'),
    Account = require('../models/index').Account,
    Dataset = require('../models/index').Dataset,
    Collection = require('../models/index').Collection;


function slugify(text) {
  return text.toString().toLowerCase()
    .split('@')[0]
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
    //limit characters
}


/**
 *
 * Get list of accounts
 *
 */
exports.index = function(req, res) {
  // Define WHERE clauses
  var filter = {
    private: false
  };
  // Set (default) limit
  var limit = req.query.limit || 10;
  // Set (default) offset
  var offset = req.query.offset | 0;

  Account.findAll({
    where: filter,
    limit: limit,
    offset: offset,
    order: 'created_at DESC'
  }).success(function(accounts) {
    return res.json(accounts);
  }).error(function(err){
    console.log(err);
    return handleError(res, err);
  });
};

/**
 *
 * Get a single account
 *
 * @param req
 * @param res
 *
 */
exports.show = function(req, res) {

  Account.find({
    where: { slug: req.params.id },
    include: [
      { model: Collection }
      //{ model: Dataset }
    ]
  }).success(function(dataset){
    //console.log(dataset);
    res.json(dataset);
  }).error(function(err){
    console.log(err);
  });
};


/**
 *
 * Creates a new account in the DB.
 *
 * @param req
 * @param res
 *
 */
exports.create = function(req, res) {
  Account.create(req.body).success(function(account) {
    return res.json(201, account);
  }).error(function(err){
    handleError(res,err);
    console.log(err);
  });
};


/**
 *
 * Updates an existing account in the DB.
 *
 * @param req
 * @param res
 *
 */
exports.update = function(req, res) {
  Account.find(req.body.id).success(function(account){
    var updated = _.merge(account, req.body);
    updated.save().success(function(account) {
    }).error(function(err) {
      handleError(res,err);
    });
  }).error(function(err){
    handleError(res,err);
  });
};

/**
 *
 * Deletes a account from the DB.
 *
 * @param req
 * @param res
 *
 */
exports.destroy = function(req, res) {
  Account.findById(req.params.id, function (err, account) {
    if(err) { return handleError(res, err); }
    if(!account) { return res.send(404); }
    account.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
