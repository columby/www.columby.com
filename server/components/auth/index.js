'use strict';

var config = require('../../config/environment'),
    jwt    = require('jwt-simple'),
    moment = require('moment')
;


/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
exports.createToken = function(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix(),
    accountId: user.accounts[ user.selectedAccount]
  };
  return jwt.encode(payload, config.jwt.secret);
};


/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
exports.ensureAuthenticated = function(req, res, next) {

  if (!req.user) { req.user={}; }

  // Check for authorization header
  if (!req.headers.authorization) {
    return res.send({status: 'error', message: 'Please make sure your request has an Authorization header'});
  }
  // Decode the token
  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.jwt.secret);
  // Check token expiration date
  if (payload.exp <= moment().unix()) {
    return res.send({status: 'error', message: 'Token has expired'});
  }

  // Attach user_id to req
  if (!payload.sub) {
    return res.send({status: 'error', message: 'No user found from token'});
  }
  req.jwt = payload;
  next();
};

