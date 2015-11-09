'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var models = require('../models/index')
var config = require('../config/config')

/**
 *
 * Check if a user's jwt token is present
 * Validate the token if present
 * And add the contents to req.
 *
 */
exports.checkJWT = function (req, res, next) {
  console.log('Validating JWT.')

  req.jwt = req.jwt || {}
  // Decode the token if present
  if (req.headers.authorization) {
    var token = req.headers.authorization.split(' ')[1]
    var payload = {
      exp: null,
      sub: null
    }
    try {
      payload = jwt.decode(token, config.jwt.secret)
    } catch (err) {

    }
    // Check token expiration date
    if ((payload.exp) && (payload.exp <= moment().unix())) {
      return res.json({status: 'error', message: 'Token has expired'})
    }
    req.jwt = payload
  }

  next()
}

/**
 *
 * Validate the user from the JWT token
 *
 */
exports.checkUser = function (req, res, next) {
  req.user = req.user || {}

  // fetch user if not present and JWT is present
  if ((!req.user.id) && (req.jwt.sub)) {
    models.User.find({
      where: { id: req.jwt.sub },
      include: [ { model: models.Account, as: 'account' } ]
    }).then(function (user) {
      // transform user
      var u = user.dataValues
      u.organisations = []
      for (var i = 0; i < user.account.length; i++) {
        var a = user.account[i].dataValues
        a.role = a.UserAccounts.dataValues.role
        delete a.UserAccounts
        if (a.primary) {
          u.primary = a
        } else {
          u.organisations.push(a)
        }
      }
      delete u.account

      req.user = u

      next()
    })
  } else {
    next()
  }
}

// Validate if a user is logged in
exports.ensureAuthenticated = function (req, res, next) {
  if (req.user && req.user.id) {
    next()
  } else {
    return res.json({status: 'error', message: 'Not authenticated'})
  }
}

exports.validateRemoteHost = function (req, res, next) {
  if (config.env === 'development') {
    next()
  } else if (config.env === 'production') {
    if (req.connection.remoteAddress !== '127.0.0.1') {
      res.json({status: 'error', msg: 'Only local connections allowed, not ' + req.connection.remoteAddress})
    } else {
      next()
    }
  } else {
    res.json({status: 'error', msg: 'No environment specified'})
  }
}
