'use strict';

var _ = require('lodash'),
    mongoose = require('mongoose'),
    Dataset = require('./dataset.model'),
    Account = mongoose.model('Account');


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


function seedDataset(dataset){
  console.log(dataset.organisation_uuid);
  var Account = require('../account/account.model');

  Account.findOne({'drupal.uuid': dataset.organisation_uuid}, function(err,account){
    //console.log(account);
    var self = this;
    if (account){
      Dataset.create({
        account       : account._id,
        title        : dataset.title,
        description : dataset.description,
        drupal: {
          uuid      : dataset.uuid
        }
      }, function (err, dataset){
        if (err) { console.log('err', err); }
        console.log('dataset created', dataset._id);
      });
    }
  });

}

// ADMIN ONLY
exports.seed = function(req,res){
  console.log('seeding datasets');
  // Get the list of users
  var datasets = require('../../seed/datasets');
  var User = require('../user/user.model');
  var Dataset = require('../dataset/dataset.model');

  console.log('Number of datasets', datasets.length);

  for (var i=0; i<datasets.length; i++){
    console.log('seeding dataset');
    seedDataset(datasets[ i]);
  }
}


exports.extractlink = function(req,res) {
  console.log(req.params);
  console.log(req.query);
  var uri = req.query.uri;
  console.log(uri);

  // get link properties
  if (uri){
    req.head(uri, function(err, result, body){
      if (res.statusCode !== 200) {
        console.log('invalid url');
      } else {
        // check for file
        console.log('valid url');
        // check for arcgis

      }


      res.json({
        headers: result,
        body: body
      });
      console.log('content-type:', result.headers['content-type']);
      console.log('content-length:', result.headers['content-length']);
    });
  } else {
    res.json({err:'no uri'});
  }
};


// Get list of datasets
exports.index = function(req, res) {

  // Dataset.find(function (err, datasets) {
  //   if(err) { return handleError(res, err); }
  //   return res.json(200, datasets);
  // });

  var filter;
  if (req.query.userId) { filter = {publisher: req.query.userId}; }

  Dataset
    .find(filter)
    .limit(15)
    .sort('-createdAt')
    .populate('account', 'slug name')
    .exec(function(err, datasets) {
      //console.log(datasets);
      if (err) { return res.json(500, { error: 'Cannot list the datasets' }); }
      return res.json(datasets);
    })
  ;
};

// Get a single dataset
exports.show = function(req, res) {
  console.log('show dataset');
  // id can be objectId or slug. Cast the id to objectId,
  // if this works then use it, otherwise treat it as a slug.
  var id,slug;
  try {
    id = new mongoose.Types.ObjectId(req.params.id);
  } catch (e) {
    console.log('Error casting param to objectID', e);
  }

  Dataset
    .findOne({
      $or: [
        { _id: id },
        { slug: slug },
      ]
    })
    .populate('account', 'slug name description owner avatar')
    .exec(function(err,dataset){
      if (err) { return handleError(res, err); }
      if (!dataset) return res.json({error:'Failed to load dataset ' + req.params.id, err:err});
      return res.json(dataset);
    });
};

// Creates a new dataset in the DB.
exports.create = function(req, res) {
  Dataset.create(req.body, function(err, dataset) {
    if(err) { return handleError(res, err); }

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
    return res.json(201, dataset);
  });
};

// Updates an existing dataset in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Dataset.findById(req.params.id, function (err, dataset) {
    if (err) { return handleError(res, err); }
    if(!dataset) { return res.send(404); }
    var updated = _.merge(dataset, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, dataset);
    });
  });
};

// Deletes a dataset from the DB.
exports.destroy = function(req, res) {
  Dataset.findById(req.params.id, function (err, dataset) {
    if(err) { return handleError(res, err); }
    if(!dataset) { return res.send(404); }
    dataset.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


/*-------------- DISTRIBUTIONS ---------------------------------------------------------------*/
exports.listDistributions = function(req, res) {
  console.log(req.params);
  var id = req.params.id;
  console.log(id);
};

exports.getDistribution = function(req,res,id){
  console.log(req.params);
};

exports.createDistribution = function(req, res) {
  console.log('creating distribution');
  var id = req.params.id;
  var distribution = req.body.distribution;
  distribution._id = mongoose.Types.ObjectId();
  Dataset
    .findOne({_id: id})
    .exec(function(err,dataset){
      if (err) return res.json({status:'error', err:err});
      if (!dataset) return res.json({error:'Failed to load dataset', err:err});
      if (!dataset.distributions) {
        dataset.distributions = [ ];
      }
      dataset.distributions.push(distribution);
      dataset.save(function(err){
        res.json({status:'success', distribution: distribution});
      });
    })
  ;
};

exports.updateDistribution = function(req, res, id) {
  console.log(req.params);
};

// Delete a source attached to a dataset
exports.destroyDistribution = function(req, res) {

  var id = String(req.params.id);
  var distributionId = String(req.params.distributionId);

  Dataset.findOne({_id:id},function(err,dataset){
    if (err) return res.json({status:'error', err:err});
    if (!dataset) return res.json({error:'Failed to load dataset', err:err});
    for (var i=0; i < dataset.distributions.length; i++){
      if (String(dataset.distributions[ i]._id) === distributionId){
        dataset.distributions.splice(i,1);
      }
    }
    dataset.save();
    res.json({status:'success'});
  });
};


/*-------------- REFERENCES --------------------------------------------------------------*/
exports.listReferences = function(req, res) {
  console.log(req.params);
  var id = req.params.id;
  console.log(id);
};

exports.getReference = function(req,res,id){
  console.log(req.params);
};

exports.createReference = function(req, res) {
  var id = req.params.id;
  var reference = req.body.reference;
  reference._id = mongoose.Types.ObjectId();
  Dataset
    .findOne({_id: id})
    .exec(function(err,dataset){
      if (err) return res.json({status:'error', err:err});
      if (!dataset) return res.json({error:'Failed to load dataset', err:err});
      if (!dataset.references) {
        dataset.sources = [ ];
      }
      dataset.references.push(reference);
      dataset.save(function(err){
        res.json({status:'success', reference: reference});
      });
    })
  ;
};

exports.updateReference = function(req, res, id) {
  console.log(req.params);
};

// Delete a source attached to a dataset
exports.destroyReference = function(req, res) {

  var id = String(req.params.id);
  var referenceId = String(req.params.referenceId);

  Dataset.findOne({_id:id},function(err,dataset){
    if (err) return res.json({status:'error', err:err});
    if (!dataset) return res.json({error:'Failed to load dataset', err:err});
    for (var i=0; i < dataset.references.length; i++){
      if (String(dataset.references[ i]._id) === referenceId){
        dataset.references.splice(i,1);
      }
    }
    dataset.save();
    res.json({status:'success'});
  });
};



function handleError(res, err) {
  return res.send(500, err);
}
