'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Dataset Schema
 */
var DatasetSchema = new Schema({

  created: { type: Date, default: Date.now },

  updated: { type: Date },

  title: { type: String, trim: true },

  description: { type: String, trim: true },

  user: { type: Schema.ObjectId, ref: 'User' },

  publishStatus: { type: String, default: 'draft' },

  // draft
  draft: {
    title: { type:String, trim:true },
    description: { type: String, trim: true },
  },

  history: { type: String }

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
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Dataset', DatasetSchema);
