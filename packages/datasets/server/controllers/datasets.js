'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Dataset = mongoose.model('Dataset'),
  User = mongoose.model('User')
  //, _ = require('lodash')
;


/**
 * Find dataset by id
 */
exports.dataset = function(req, res, next, id) {

  Dataset
    .findOne({_id: id}, function(err,dataset){
      if (err) return next(err);
      if (!dataset) return res.json({error:'Failed to load dataset ' + id, err:err});

      var opts = [{ path:'publisher', model:dataset.publisherType, select: 'name slug description avatar plan'}];

      Dataset.populate(dataset, opts, function(err, pop){
        req.dataset = dataset;
        next();
      });
    })
  ;
};

/**
 * Create an dataset
 */
exports.create = function(req, res) {

  var dataset = new Dataset(req.body);
  dataset.publishStatus = 'draft';

  dataset.save(function(err) {
    if (err) { return res.json({error: err }); }
    // update publication account.

    if (dataset.publisherType === 'User') {
      User.findByIdAndUpdate(
        { _id: dataset.publisher },
        { $push: { datasets: dataset._id } },
        { safe: true, upsert: true },
        function(err, model) {
          console.log(err);
          console.log('model', model);
        }
      );
    }

    console.log('Dataset created', dataset);
    res.json(dataset);
  });
};

/**
 * Update an dataset
 */
exports.update = function(req, res) {

  Dataset.findOne({ _id: req.dataset.id }, function (err, dataset){

    dataset.title = req.body.title;
    dataset.description = req.body.description;
    dataset.updated = new Date();

    dataset.save(function(err){
      if (err) {
        return res.json(500, {
          error: 'Cannot update the dataset'
        });
      }

      res.json(dataset);
    });
  });
};

/**
 * Delete an dataset
 */
exports.destroy = function(req, res) {
  var dataset = req.dataset;

  dataset.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the dataset'
      });
    }
    res.json(dataset);

  });
};

/**
 * Show an dataset
 */
exports.show = function(req, res) {
  res.json(req.dataset);
};

/**
 * List of Datasets
 */
exports.all = function(req, res) {
  var filter;
  if (req.query.userId) { filter = {publisher: req.query.userId}; }

  Dataset
    .find(filter)
    .sort('-created')
    .exec(function(err, datasets) {
      if (err) { return res.json(500, { error: 'Cannot list the datasets' }); }
      var opts = [{ path:'publisher', model:datasets.publisherType, select: 'name slug avatar plan'}];
      Dataset.populate(datasets, opts, function(err, pop){
        res.json(datasets);
      });
    })
  ;
};


// Update draft of a dataset.
exports.autosave = function(req,res) {

  var id = req.body.id;
  var draft = req.body.draft;
  console.log('Received draft', draft);
  Dataset
    .findOne({_id: id})
    .select()
    .exec(function(err,dataset){
      // If status is draft, save it directly
      console.log(dataset);
      if (dataset.publishStatus === 'draft') {
        console.log('updating draft directly');
        if (draft.title) dataset.title = draft.title;
        if (draft.description) dataset.description = draft.description;
        dataset.draft = null;
      } else {
        // otherwise save the changes as draft.
        console.log('saving draft');
        dataset.draft = draft;
      }
      dataset.save(function(err){
        if (err) console.log(err);
        console.log(dataset);
        res.json(dataset);
      });
    })
  ;
};
