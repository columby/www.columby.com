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

  _id: {
    type: String,
    unique: true,
    'default': shortId.generate
  },

  // Dataset properties
  created: { type: Date, default: Date.now },
  updated: { type: Date },
  title: { type: String, trim: true },
  description: { type: String, trim: true },

  // Publication account (user/organisation)
  publisherType: {
    type: String
  },
  publisher: {
    type: Schema.ObjectId,
    ref:  'User'
  },

  // Status of the publication
  publishStatus: { type: String, default: 'draft' },
  draft: {
    title: { type:String, trim:true },
    description: { type: String, trim: true },
  },

  // publication activity
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
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
  this.findOne({
    _id: id
  }).populate('user', 'name username slug').exec(cb);
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
