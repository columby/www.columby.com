'use strict';

var config = require('../config/config'),
    jwt    = require('jwt-simple'),
    moment = require('moment'),
    request = require('request');


/**
 *
 * Check if a valid jwt is provided
 *
 */
exports.checkJWT = function(req,res,next){
  console.log('checking jwt');
  req.jwt = req.jwt || {};

  // Decode the token if present
  if (req.headers.authorization){
    var token = req.headers.authorization.split(' ')[1];
    try {
      var payload = jwt.decode(token, config.jwt.secret, 'base64');
      // Check token expiration date
      if ( (payload.exp) && (payload.exp > moment().unix()) ) {
        req.jwt = payload
      }
      next();
    } catch (err){
      console.log('err ', err);
    }
  } else {
    next();
  }
};


/**
 *
 * Check the user from the JWT token at auth0
 *
 */
exports.checkUser = function(req,res,next) {
  console.log('checking user');
  req.user = req.user || {};

  // Check if there is an authorization token supplied
  if (!req.user.email && (req.headers && req.headers.authorization)){
    // get the token
    var token = req.headers.authorization.split(' ')[1];
    // Send a request to auth0 to get user info based on token
    request.post(
      'https://columby-dev.eu.auth0.com/tokeninfo',
      { form: { id_token: token } },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          // parse result to json
          var u = JSON.parse(body);
          // validate if user
          if (u.email) {
            req.user = u;
          }
        }
        // Always proceed
        next();
      }
    );
  } else {
    console.log('Anonymous');
    next();
  }
};


/**
 *
 * Validate if a user is logged in
 *
 **/
exports.ensureAuthenticated = function(req,res,next) {
  console.log('Ensure authenticated');
  if (req.user && req.user.email){
    console.log('Authenticated. ');
    next();
  } else {
    return res.json({status: 'error', message: 'Not authenticated'});
  }
}
