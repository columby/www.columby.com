'use strict';
var mongoose = require('mongoose');
var _ = require('lodash');
var Account = require('./account.model');


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


function seedOrg(organisation){
  console.log(organisation.admin_uuid);
  var User = require('../user/user.model');

  User.findOne({'drupal_uuid': organisation.admin_uuid}, function(err,user){
    var self = this;
    Account.create({
      owner   : user._id,
      name    : organisation.title,
      slug    : organisation.title,
      primary : false,
      description: organisation.description,
      drupal_uuid: organisation.uuid
    }, function (err,account){
      if (err) { console.log('err', err); }
      console.log('acount created', account);
    });
  });

}

// ADMIN ONLY
exports.seed = function(req,res){
  console.log('seeding accounts: organisations');
  // Get the list of users
  var organisations = require('../../seed/organisations');
  console.log('organisations', organisations.length);
  //remove existing non-primary accounts
  Account.find({primary:false}).remove(function(err){
    console.log(err);
    for (var i=0; i<organisations.length; i++){
      seedOrg(organisations[ i]);
    }
  })
}

// Get list of accounts
exports.index = function(req, res) {
  Account.find(function (err, accounts) {
    if(err) { return handleError(res, err); }
    return res.json(200, accounts);
  });
};

// Get a single account
exports.show = function(req, res) {
  Account.findOne({slug: req.params.id})
    .populate('datasets')
    //.populate('collections', 'title description datasets')
    .exec(function(err, account) {
      if(err) { return handleError(res, err); }
      console.log(account);
      return res.json(account);
    });
};

// Creates a new account in the DB.
exports.create = function(req, res) {
  Account.create(req.body, function(err, account) {
    if(err) { return handleError(res, err); }
    return res.json(201, account);
  });
};

// Updates an existing account in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Account.findById(req.params.id, function (err, account) {
    if (err) { return handleError(res, err); }
    if(!account) { return res.send(404); }
    var updated = _.merge(account, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, account);
    });
  });
};

// Deletes a account from the DB.
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
