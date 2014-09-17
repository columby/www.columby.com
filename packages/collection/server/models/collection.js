'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;


var CollectionSchema = new Schema({

  account: { type: ObjectId, ref: 'Account', required: true },

  title: { type: String },

  description: { type: String },

  headerImage: { type: String },

  headerPattern: { type: String },

  datasets :[{ type: ObjectId, ref: 'Dataset' }],

  createdAt : { type: Date, default: Date.now() },

  updatedAt : { type: Date}

});


mongoose.model('Collection', CollectionSchema);
