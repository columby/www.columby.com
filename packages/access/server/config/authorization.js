'use strict';

var mean = require('meanio'),
    config = mean.loadConfig(),
    mongoose = require('mongoose'),
    UserModel = mongoose.model('User'),
    jwt = require('jwt-simple');

// Check token validity


// Verify token and get user's account
exports.jwtCheckAccount = function(req, res, next){

  if (!req.user){

    var token;

    if (req.headers && req.headers.authorization){
      console.log('auth', req.headers.authorization);
      var parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        var scheme = parts[0],
          credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        console.log('Format is Authorization: Bearer [token]');
        //return res.status(401).json({err: 'Format is Authorization: Bearer [token]'});
      }

      var decoded = jwt.decode(token, config.jwt.secret);
      console.log('jwt token', decoded);

      if (decoded.exp <= Date.now()) {
        console.log('Access token has expired');
        //res.status(401).json('Access token has expired');
      }


      UserModel.findOne({ '_id': decoded.iss }, function(err,user){
        console.log('userfind error',err);
        console.log('user',user);
        if (!err) {
          // reconstruct account
          req.user = user;
          console.log('User attached to req.');
        }
        next();
      });

    } else {
      console.log('No Authorization header was found');
      return res.status(401).json({err: 'No Authorization header was found'});
    }
  }
};

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.user._id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
  if (!req.user._id || !req.user.hasRole('admin')) {
    return res.send(401, 'User is not authorized');
  }
  next();
};
