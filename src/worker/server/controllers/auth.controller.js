'use strict';

/**
 * Dependencies
 */
var config = require('../config/config'),
  jwt    = require('jwt-simple'),
  moment = require('moment'),
  request = require('request');
var logger = require('winston');

/**
 *
 * Check if a user's jwt token is present
 * And add the user id to req
 *
 */
exports.checkJWT = function (req, res, next) {
  console.log('Checking JWT.');
  req.jwt = req.jwt || {};

  // Decode the token if present
  if (req.headers.authorization){
    var token = req.headers.authorization.split(' ')[1];
    try {
      var payload = jwt.decode(token, config.jwt.secret, 'base64');
      // Check token expiration date
      if ( (payload.exp) && (payload.exp > moment().unix()) ) {
        console.log('Token found.');
        req.jwt = payload;
      }
      next();
    } catch (err){
      console.log('err ', err);
      next();
    }
  } else {
    next();
  }
};


exports.checkUser = function (req, res, next) {
  logger.debug('AuthController: Validate user. ');
  req.user = req.user || {};

  // Check if there is an authorization token supplied
  if (!req.user.email && (req.headers && req.headers.authorization)){
    // get the token
    var token = req.headers.authorization.split(' ')[1];
    // Send a request to auth0 to get user info based on token
    request.post(
      config.auth0.domain + 'tokeninfo',
      { form: { id_token: token } },
      function (error, response, body) {
        if (error) {
          logger.debug('There was an error: ' + error);
        } else if(response.statusCode === 200) {
          // parse result to json
          var u = JSON.parse(body);
          // validate if user
          if (u.email) {
            console.log('User found.');
            req.user = u;
          }
        } else {
          logger.debug('Something went wrong fetching the user.');
        }
        // Always proceed
        next();
      }
    );
  } else {
    console.log('Anonymous user. ');
    next();
  }
};


// Validate if a user is logged in
exports.ensureAuthenticated = function (req, res, next) {
  if (req.user && req.user.email){
    next();
  } else {
    return res.json({status: 'error', message: 'Not authenticated'});
  }
};
