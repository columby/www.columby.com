'use strict';

var _             = require('lodash'),

    User          = require('../models/index').User,
    Token         = require('../models/index').Token,
    Account       = require('../models/index').Account,

    config        = require('../config/environment/index'),
    auth          = require('../controllers/auth.controller'),
    emailService  = require('../controllers/email.controller');


/**
 *
 * Provide the currently logged in user details
 *
 */
exports.me = function(req, res) {
  console.log(req.jwt.sub);
  var t = req.jwt.sub;
  User.find({ where: {uuid:req.jwt.sub}})
    //.populate('accounts', 'name slug plan avatar primary')
    .success(function(user) {
      return res.json(user);
    })
    .error(function(err){
      console.log('something went wrong!');

      handleError(res,err);
    });
};


exports.config = function(req,res){
  var c = {
    aws: {
      publicKey : config.aws.publicKey,
      bucket    : config.aws.bucket,
      endpoint  : config.aws.endpoint
    },
    embedly: {
      key       : config.embedly.key
    }
  };

  return res.json(c);
};


/**
 *
 * Get list of users
 *
 * Site admins only
 *
 **/
exports.index = function(req, res) {
  User.find(function (err, users) {
    if(err) { return handleError(res, err); }
    return res.json(users);
  });
};


/**
 *
 * Get a single user by user._id
 *
 * Site admins only
 *
 * @param req.params.id
 *
 **/
exports.show = function(req, res) {
  User.findOne({_id: req.params.id}, function (err, user) {
    console.log('user', user);
    if(err) { return handleError(res, err); }
    return res.json(user);
  });
};


/**
 *
 * Create a new user.
 *
 * Publicly accessible by registration form.
 *
 * @param req.body.email
 * @param req.body.name
 *
 * Create:
 *    new User,
 *    new Account (primary),
 *    update User with account-reference
 *    new login-token
 *    email user with login token
 *
 **/
exports.register = function(req, res) {
  console.log('new user', req.body);
  // Try to create a new user
  User.create(req.body)
    // Handle successful user creation
    .success(function(user) {

      // Create a primary publication account for this user.
      Account.create({
        name: req.body.name,
        primary: true
      }).success(function(account){
        console.log('new account');
        user.addAccount(account).success(function(account){
          // Send email to user with login link.
          var vars = {
            user: {
              email: user.email,
              name: account.name
            }
          };
          console.log('var', vars);
          // emailService.preRegister / emailService.register
          emailService.preRegister(vars, function (result) {
            if (result[0].status === 'sent') {
              return res.json(user._id);
            } else {
              return handleError(res, {status: 'error', err: 'Error sending mail.'});
            }
          });
        }).error(function(err){
          user.destroy();
          console.log('err',err);
          handleError(res,err);
        });
      }).error(function(err){
        console.log(err);
        handleError(res,err);
      });
    }).error(function(err){
      console.log(err);
      handleError(res,err);
    });
};


/**
 *
 * Update an existing user.
 *
 * Admins only
 *
 * @param req.body.verified
 * @param req.body.accounts
 *
 *
 **/
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  User.findById(req.params.id, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, user);
    });
  });
};


/**
 *
 * Delete an existing user.
 *
 * Admins only
 *
 * @param req.body.verified
 * @param req.body.accounts
 *
 * Delete:
 *   Delete primary account
 *   Delete User
 *   Send email to user
 *
 **/
exports.destroy = function(req, res) {
  User.findById(req.params.id, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    user.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};


/**
 *
 * Login a user with an email-address and send a one-time login-token back
 *
 * Public access
 *
 * @param req.body.email
 *
 **/
exports.login = function(req,res) {
  console.log('Finding user ', req.body.email);
  User
    .findOne({
      where: {
        email: req.body.email
      }
    })
    .success(function(user) {
      if (!user){ return res.send(user); }

      // create a new logintoken
      var token = new Token({user: user._id});
      token.save(function(err) {
        if (err) { return handleError(res,err); }
        // Send the new token by email
        var vars = {
          tokenurl: req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
          user: {
            email: user.email,
            name: user.name
          }
        };
        emailService.login(vars, function(result){
          if (result[0].status === 'sent') {
            return res.json(user._id);
          } else {
            return handleError(res, { status: 'error', err: 'Error sending mail.' });
          }
        });
      });
    })
    .error(function(err){
      if (err) { return handleError(res, err); }
    });
};


/**
 *
 * Verify a supplied token and return a JWT when validated.
 *
 * Public access
 *
 * @param req.query.token
 *
 **/
exports.verify = function(req,res) {

  var loginToken = req.query.token;

  // Check if supplied token exists and delete it after use
  Token.findOneAndRemove({'token': loginToken}, function(err,token){
    if (err) { return handleError(res,err); }
    if (!token) { return res.json({status:'error',err:'token not found'})}
    // Find the user connected to the token
    User
      .findOne({_id: token.user})
      .populate('accounts', 'name slug plan avatar primary')
      .exec(function(err,user){
        if (err) { return handleError(res,err); }
        if (!user) { return res.json(user)}
        // Make user verified if needed
        if (user.verified === false){
          user.verified=true;
          user.save();
        }
        // Send back a JWT
        return res.json({
          user  : user,
          token : auth.createToken(user)
        });
      })
    }
  );
};


/**
 *
 * Error handler
 *
 **/
function handleError(res, err) {
  console.log('User Controller error:', err);
  return res.json({status: 'error', msg: err});
}
