'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


function slugify(text) {

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
    //limit characters

}
/**
 * Validations
 */
/*
var validateOrganisationType = function(value, callback) {
  if (value !== 'user'){
    callback(false);
  } else {
    callback(true);
  }
};
*/

/**
 * Publication Account Schema
 */

var OrganisationSchema = new Schema({

  // Account settings
  name: {
    type: String,
    unique: true
  },

  slug: {
    type: String,
    unique: true
  },

  plan: {
    type: String,
    default: 'free'
  },

  // Profile Settings
  description: {
    type: String,
    required: false
  },

  avatar: {
    type: String,
    required: false
  },

  // Reference to Organisation's Administrator
  administrator: {
    type: String,
    ref: 'User'
  },

  // Reference to Datasets published by this organisation
  datasets:[{
    type: String,
    ref: 'Dataset'
  }],

});



/**
 * Pre-save hook
 */
OrganisationSchema.pre('save', function(next) {

  var self=this;
  var slug=slugify(self.name);
  self.set('slug', slug);

  next();
});

/**
 * Methods
 */


OrganisationSchema.statics.findBySlug = function(slug, cb) {
  var Organisation = mongoose.model('Organisation');

  Organisation
    .findOne({slug: slug})
    .exec(function(err,p){
      cb(err, p);
    });
};

mongoose.model('Organisation', OrganisationSchema);
