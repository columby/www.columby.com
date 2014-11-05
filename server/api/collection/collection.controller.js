'use strict';

var _ = require('lodash');
var Collection = require('./collection.model');

// Get list of collections
exports.index = function(req, res) {
  Collection
    .find({})
    .populate('datasets', 'title')
    .populate('account', 'name')
    .exec(function (err, collections) {
    if(err) { return handleError(res, err); }
    return res.json(200, collections);
  });
};

// Get a single collection
exports.show = function(req, res) {
  Collection
    .findOne({_id: req.params.id})
    .populate('datasets', 'title')
    .populate('account', 'name avatar slug')
    .exec(function (err, collection) {
      if(err) { return handleError(res, err); }
      if(!collection) { return res.send(404); }
      return res.json(collection);
    }
  );
};


function handleError(res, err) {
  return res.send(500, err);
}
