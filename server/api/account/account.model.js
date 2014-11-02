'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema
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

  roles       : {type: Array, default: ['authenticated']},

  avatar      : {
    url         : {
      type: String,
      required: false,
      default: 'assets/images/avatar.png'}
  },

  owner       : {
    type        : Schema.ObjectId,
    ref         : 'User',
    required    : true
  },

  datasets    : [{ type: Schema.ObjectId, ref: 'Dataset' }],

  apikeys     : [ ],

  collections : [{ type: Schema.ObjectId, ref: 'Collection' }],

  createdAt   : { type:Date },
  updatedAt   : { type: Date },

  drupal_uuid : { type:String }

});



/**
 * Pre-save hook
 */
AccountSchema.pre('save', function(next) {

  // When saving the new account, create a slug based on the username.
  this.set('slug', slugify(this.slug));

  // Create a new api-key for a new publication account.
  if (this.isNew){
    //console.log('setting the default API-key');
    this.apikeys.push(String(mongoose.Types.ObjectId()));
  }

  next();
});

AccountSchema.post('save', function(account){
  var User = mongoose.model('User');
  //console.log('action after save, updating user accounts list');
  User.findOne({_id: account.owner}, function(err,user){
    if (err) { console.log(err); }
    //console.log('user findone:', user);
    if (user){
      if (user.accounts.indexOf(account._id) === -1) {
        user.accounts.push(account._id);
        user.save();
        //console.log('user updated:', user);
      }
    }
  });
});



module.exports = mongoose.model('Account', AccountSchema);
