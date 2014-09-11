'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  PublicationAccount = mongoose.model('PublicationAccount')
;

/* --- FUNCTIONS --------------------------------------------------------------- */

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
  headerImage: {
    type: String,
    default: '/columby/assets/img/header/images/header_bg_01.png'
  },
  headerPattern: {
    type: String,
    default: '/columby/assets/img/header/patterns/1.svg'
  },


  /**
   * Publication Accounts
   **/
  publicationAccounts: {
    type: Array
  },


  /**
   * Passwordless login
   **/
  jwt: {
    type: Array,
    default: []
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
  console.log('usermodel, updating pubAccount');
  // add default publication account
  var pubAccount = new PublicationAccount({
    owner: self._id,
    accountType: 'personal',
    plan: 'free',
    name: self.username,
    slug: self.slug,
    description: self.description
  });
  console.log('puaccount', pubAccount);
  self.publicationAccounts.push(pubAccount);

  next();
});


/*
UserSchema.post('save', function (user) {
  createPublicationAccount(user);
});
*/

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
    return this.roles.indexOf('administrator') !== -1;
  }
};

UserSchema.statics.getAccount = function(id, cb) {
  var account = {};
  var User = mongoose.model('User');
  var PubAccounts = mongoose.model('PublicationAccount');

  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) cb({err:err});
      if (!user) cb({'Failed to load User ': id});
      account = user;
      console.log('account1: ', account);

      PubAccounts.find({owner:account._id})
        .exec(function(err,pubAccounts){
          console.log('err', err);
          console.log('pubAccounts', pubAccounts);
          if (err) cb({err:err});
          if (!pubAccounts) cb({err: 'Failed to load pubaccounts'});

          account.pubAccounts = pubAccounts;
        });
      console.log('account2: ', account);
      cb({account: account});
    });
};

UserSchema.statics.findBySlug = function(slug, cb) {
  var User = mongoose.model('User');

  User
    .findOne({slug: slug}, 'username description roles headerImage headerPattern')
    .exec(function(err,p){
      cb(err, p);
    });
};

mongoose.model('User', UserSchema);
