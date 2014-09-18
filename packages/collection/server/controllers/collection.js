'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Collection = mongoose.model('Collection')
  //, _ = require('lodash')
;


/**
 * Find collection by id
 */
exports.collection = function(req, res, next, id) {

  Collection
    .findOne({_id: id})
    .populate('account', 'name description slug')
    .exec(function(err,collection){
      
      if (err) return next(err);
      if (!collection) return res.json({error:'Failed to load collection ' + id, err:err});

      Collection.populate('datasets', 'title', function(err, pop){
        req.collection = collection;
        next();
      });
    })
  ;
};

/**
 * Create an collection
 */
exports.create = function(req, res) {

  var collection = new Collection(req.body);
  collection.save(function(err) {
    if (err) { return res.json({error: err }); }
    // update publication account.

    console.log('Collection created', collection);
    res.json(collection);
  });
};

/**
 * Update an collection
 */
exports.update = function(req, res) {

  Collection.findOne({ _id: req.collection.id }, function (err, collection){

    collection.title = req.body.title;
    collection.description = req.body.description;
    collection.updated = new Date();

    collection.save(function(err){
      if (err) {
        return res.json(500, {
          error: 'Cannot update the collection'
        });
      }

      res.json(collection);
    });
  });
};

/**
 * Delete an collection
 */
exports.destroy = function(req, res) {
  var collection = req.collection;

  collection.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the collection'
      });
    }
    res.json(collection);

  });
};

/**
 * Show an collection
 */
exports.show = function(req, res) {
  res.json(req.collection);
};

/**
 * List of Collections
 */
exports.all = function(req, res) {
  var filter;
  if (req.query.userId) { filter = {publisher: req.query.userId}; }

  Collection
    .find(filter)
    .sort('-created')
    .exec(function(err, collections) {
      if (err) { return res.json(500, { error: 'Cannot list the collections' }); }
      Collection.populate('datasets', 'name', function(err, pop){
        res.json(collections);
      });
    })
  ;
};
