'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Dataset = mongoose.model('Dataset'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId
;

function canEdit(req){

  // check if user is owner of the dataset's account.
  if (req.user && req.user.hasOwnProperty('_id')){
    if ( String(req.dataset.account.owner) === String(req.user._id)) {
      return 'true';
    } else {
      return 'false';
    }
  }

}

/**
 * Find dataset by id
 */
exports.dataset = function(req, res, next, id) {

  Dataset
    .findOne({_id: id})
    .populate('account', 'slug name description owner')
    .exec(function(err,dataset){
      if (err) return next(err);
      if (!dataset) return res.json({error:'Failed to load dataset ' + id, err:err});

      // Attach dataset to request
      req.dataset = dataset;

      next();
    })
  ;
};

/**
 * Create an dataset
 */
exports.create = function(req, res) {

  var Account = mongoose.model('Account');
  var dataset = new Dataset(req.body);
  dataset.publishStatus = 'public';

  dataset.save(function(err) {
    if (err) { return res.json({error: err }); }

    console.log(dataset.account);
    // update publication account.
    Account.findByIdAndUpdate(
        { _id   : dataset.account },
        { $push : { datasets: dataset._id } },
        { safe  : true, upsert: true },
        function(err, model) {
          console.log(err);
          console.log('model', model);
        }
    );

    res.json(dataset);
  });
};

/**
 * Update an dataset
 */
exports.update = function(req, res) {

  Dataset.findOne({ _id: req.dataset.id }, function (err, dataset){

    console.log('updating dataset', req.body);

    if (req.body.title){
      dataset.title   = req.body.title;
    }

    if (req.body.description) {
      dataset.description = req.body.description;
    }
    if (dataset.sources) {
      dataset.sources = req.body.sources;
    }

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
  // determine if user can edit the dataset
  req.dataset.canEdit = canEdit(req);

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
    .populate('account')
    .exec(function(err, datasets) {
      if (err) { return res.json(500, { error: 'Cannot list the datasets' }); }
      var opts = [{ path:'publisher', model:datasets.publisherType, select: 'name slug avatar plan'}];
      Dataset.populate(datasets, opts, function(err, pop){
        res.json(datasets);
      });
    })
  ;
};




/*-------------- SOURCES -------------------*/
exports.listSources = function(req, res) {
  console.log(req.params);
  var datasetId = req.params.datasetId;
  console.log(datasetId);
};

exports.getSource = function(req,res,id){
  console.log(req.params);
};

exports.createSource = function(req, res) {
  var datasetId = req.params.datasetId;
  var source = req.body.source;
  source._id = mongoose.Types.ObjectId();
  Dataset
    .findOne({_id: datasetId})
    .exec(function(err,dataset){
      if (err) return res.json({status:'error', err:err});
      if (!dataset) return res.json({error:'Failed to load dataset', err:err});
      if (!dataset.sources) {
        dataset.sources = [ ];
      }
      dataset.sources.push(source);
      dataset.save(function(err){
        res.json({status:'success', source: source});
      });
    })
  ;
};

exports.updateSource = function(req, res, id) {
  console.log(req.params);
};

/**
 * Delete a source attached to a dataset
 *
 **/
exports.destroySource = function(req, res, id) {

  var datasetId = String(req.params.datasetId);
  var sourceId = String(req.params.sourceId);

  Dataset.findOne({_id:datasetId},function(err,dataset){
    if (err) return res.json({status:'error', err:err});
    if (!dataset) return res.json({error:'Failed to load dataset', err:err});
    for (var i=0; i < dataset.sources.length; i++){
      if (String(dataset.sources[ i]._id) === sourceId){
        dataset.sources.splice(i,1);
      }
    }
    dataset.save();
    res.json({status:'success'});
  });
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
