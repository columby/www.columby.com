'use strict';

/**
 * Module dependencies.
 */
var mean = require('meanio'),
    config = mean.loadConfig(),
    mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic'),
    Schema = mongoose.Schema,
    shortId = require('shortid');


/**
 * Dataset Schema
 */
var DatasetSchema = new Schema({

  // Dataset properties
  created         : { type: Date, default: Date.now },
  updated         : { type: Date },
  title: { type   : String, trim: true },
  description     : { type: String, trim: true },

  account         : { type: Schema.ObjectId, ref:  'Account' },

  publishStatus   : { type: String, default: 'draft' },
  draft : {
      title         : { type:String, trim:true },
      description   : { type: String, trim: true },
  },

  history: [{
    date: { type: Date, default: Date.now },
    acitvity: { type: String }
  }]
});



// Elasticsearch
var url               = require('url');
var elasticConnection = url.parse(process.env.BONSAI_URL || config.elasticsearch.url);

DatasetSchema.plugin(mongoosastic, {
  host:elasticConnection.hostname,
  curlDebug:true,
  auth: elasticConnection.auth,
  port: elasticConnection.port,
  protocol: elasticConnection.protocol === 'https:' ? 'https' : 'http'
});



/**
 * Validations
 */
DatasetSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');


/**
 * Statics
 */
DatasetSchema.statics.load = function(id, cb) {
  var Dataset = mongoose.model('Dataset');
  Dataset
    .findOne({_id: id}, function(err,dataset){
      var opts = [{ path:'publisher', model:dataset.publisherType, select: 'name slug description avatar plan'}];
      Dataset.populate(dataset, opts, cb);
    });
};

mongoose.model('Dataset', DatasetSchema);

/*
var stream = Dataset.synchronize();
var count = 0;

stream.on('data', function(err, doc){
  count++;
});
stream.on('close', function(){
  console.log('indexed ' + count + ' documents!');
});
stream.on('error', function(err){
  console.log(err);
});
*/
