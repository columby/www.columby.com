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
}
/**
 * Validations
 */
/*
var validatePresenceOf = function(value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || (value && value.length);
};
*/

var validateUniqueEmail = function(value, callback) {
  var User = mongoose.model('User');
  User.find({
    $and: [{
      email: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, user) {
    callback(err || user.length === 0);
  });
};

/**
 * User Schema
 */

var UserSchema = new Schema({

  /**
   * Account fields
   **/

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email'],
    validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },
  slug: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  roles: {
    type: Array,
    default: ['authenticated']
  },


  /**
   * Profile fields
   **/
  description: {
    type: String,
    required: false
  },
  headerBackground: {
    type: String,
    required: false
  },


  /**
   * Passwordless login
   **/
  provider: {
    type: String,
    default: 'local'
  }
});



/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  //if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
  //return next(new Error('Invalid password'));

  //http://blog.benmcmahen.com/post/41122888102/creating-slugs-for-your-blog-using-express-js-and
  var self=this;
  var slug=slugify(self.username);
  self.set('slug', slug);

  next();
});

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    var roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  }
};

UserSchema.statics.findBySlug = function(slug, cb) {
  var User = mongoose.model('User');

  User
    .findOne({slug: slug}, 'username description roles headerBackground')
    .exec(function(err,p){
      cb(err, p);
    });
};

mongoose.model('User', UserSchema);
