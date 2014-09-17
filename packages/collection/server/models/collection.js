'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var CollectionSchema = new Schema({

  name: { type: String, unique: true },

  slug: { type: String, unique: true },

  description: { type: String, required: false },

  owner: { type: String, ref: 'User' },

  headerImage: { type: String },

  headerPattern: { type: String },

  datasets:[{ type: String, ref: 'Dataset' }],

});


CollectionSchema.statics.findBySlug = function(slug, cb) {
  var Collection = mongoose.model('Collection');

  Collection
    .findOne({slug: slug})
    .exec(function(err,p){
      cb(err, p);
    });
};


mongoose.model('Collection', CollectionSchema);
