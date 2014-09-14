'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  uuid = require('node-uuid');



/**
 * Token Schema
 */

var LoginTokenSchema = new Schema({

  token: {
    type: String,
    required: true,
    default: uuid.v4()
  },

  createdAt: {
    type: Date,
    default: new Date(),
    expires: '4h'
  },

  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },

});



mongoose.model('LoginToken', LoginTokenSchema);