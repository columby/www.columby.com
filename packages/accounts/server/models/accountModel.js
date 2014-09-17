'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema
  //User = mongoose.model('User')
;


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
var validateAccountType = function(value, callback) {
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

var AccountSchema = new Schema({

  // Account settings
  name        : { type: String, unique: true },

  slug        : { type: String, unique: true },

  primary     : { type: Boolean },

  plan        : { type: String, default: 'free' },

  description : { type: String, required: false },

  avatar      : { type: String, required: false },

  owner       : { type: Schema.ObjectId, ref: 'User' },

  datasets    : [{ type: Schema.ObjectId, ref: 'Dataset' }],

  collections : [{ type: Schema.ObjectId, ref: 'Collection' }]

});



/**
 * Pre-save hook
 */
AccountSchema.pre('save', function(next) {

  var self=this;
  var slug=slugify(self.name);
  self.set('slug', slug);

  next();
});



/**
 * Methods
 */

AccountSchema.statics.findBySlug = function(slug, cb) {
  var Account = mongoose.model('Account');

  Account
    .findOne({slug: slug})
    .exec(function(err,p){
      cb(err, p);
    });
};

mongoose.model('Account', AccountSchema);
