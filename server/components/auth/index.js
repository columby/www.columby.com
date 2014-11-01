'use strict';

var config = require('../../config/environment'),
    jwt = require('jwt-simple'),
    User = require('../../api/user/user.model')
;

exports.checkJWT = function(req,res,next){

  if (!req.user){

    var token;

    if (req.headers && req.headers.authorization){
      //console.log('auth', req.headers.authorization);
      var parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        var scheme = parts[0],
          credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        console.log('Format is Authorization: Bearer [token]');
        return res.status(401).json({err: 'Format is Authorization: Bearer [token]'});
      }

      var decoded = jwt.decode(token, config.jwt.secret);
      //console.log('jwt token', decoded);

      if (decoded.exp <= Date.now()) {
        console.log('Access token has expired');
        //res.status(401).json('Access token has expired');
      }

      User.findOne({ '_id': decoded.iss }, function(err,user){
        if (err) {
          return res.status(401).json({err: 'Error finding the user'});
        }
        if (user){
          req.user = user;
          console.log('User attached to req.');
          next();
        }
      });
    } else {
      console.log('No Authorization header was found');
      return res.status(401).json({err: 'No Authorization header was found'});
    }
  } else {
    next();
  }
}

/**
 * Generic require login routing middleware
 */
exports.isLoggedIn = function(req, res, next) {
  console.log('Checking if user is logged in.');
  if (!req.user._id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};


exports.isAdmin = function(req, res, next) {
  if (!req.user._id || !req.user.isAdmin) {
    return res.send(401, 'User is not admin');
  } else {
    next();
  }
};
