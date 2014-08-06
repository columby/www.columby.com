'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uuid = require('node-uuid');

/**
 * Validations
 */


/**
 * VerificationToken Schema
 */
var VerificationTokenSchema = new Schema({

    _userId: {
      type: Schema.ObjectId,
      required: true,
      ref: 'User'
    },

    token: {
      type: String,
      required: true
    },

    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: '4h'
    }
});

/**
 * Methods
 */
VerificationTokenSchema.methods.createVerificationToken = function(done){
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
        if (err) return done(err);
        //console.log('Verification token', verificationToken);
        return done(null, token);
    });
};

mongoose.model('VerificationToken', VerificationTokenSchema);
