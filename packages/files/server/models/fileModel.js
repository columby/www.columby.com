'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Dataset Schema
 */
var FileSchema = new Schema({

  _id:     { type: Schema.ObjectId },
  created: { type: Date, default: Date.now },
  updated: { type: Date },
  url:     { type: String }
});


mongoose.model('File', FileSchema);
