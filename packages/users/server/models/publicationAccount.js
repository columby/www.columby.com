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
var validatePublicationAccountType = function(value, callback) {
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

var PublicationAccountSchema = new Schema({

  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },

  accountType: {
    type: String,
    //validate: [validatePublicationAccountType, 'Not a valid account type']
  },

  plan: {
    type: String,
    default: 'free'
  },

  name: {
    type: String,
    unique: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: {
    type: String,
    required: false
  },

  avatar: {
    type: String,
    required: false
  },

  datasets:[{
    dataset: {
      id: {
        type: Schema.ObjectId,
        ref: 'Dataset'
      }
    }
  }],

});



/**
 * Pre-save hook
 */
PublicationAccountSchema.pre('save', function(next) {

  var self=this;
  var slug=slugify(self.name);
  self.set('slug', slug);

  next();
});

/**
 * Methods
 */


PublicationAccountSchema.statics.findBySlug = function(slug, cb) {
  var PublicationAccount = mongoose.model('PublicationAccount');

  PublicationAccount
    .findOne({slug: slug})
    .exec(function(err,p){
      cb(err, p);
    });
};

mongoose.model('PublicationAccount', PublicationAccountSchema);
