'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema
;


/* --- VALIDATIONS ------------------------------------------------------------- */

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

// Validate not in accounts array

/* --- SCHEMA ------------------------------------------------------------------ */

var UserSchema = new Schema({

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email'],
    validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },

  verified  : { type: Boolean, default: false },

  accounts  : [{ type: Schema.ObjectId, ref: 'Account' }],

  createdAt : { type: Date, default: new Date() }

});



/* --- METHODS ---------------------------------------------------------------- */

UserSchema.methods = {
  addAccountReference: function(accountId){
    if (this.accounts.indexOf(accountId) !== -1) {
      this.accounts.push(accountId);
      return true;
    } else {
      return false;
    }
  }
};


mongoose.model('User', UserSchema);
