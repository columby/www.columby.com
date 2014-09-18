'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Token = mongoose.model('LoginToken'),
    Account = mongoose.model('Account'),
    moment = require('moment'),
    jwt = require('jwt-simple'),
    config = require('meanio').loadConfig(),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.mandrill.key)
;

/**
 * Send logged in User account
 */
exports.user = function(req, res) {

  // get user
  if (req.user && req.user._id) {
    User
      .findById(req.user._id)
      .populate('accounts')
      .exec(function(err,user) {
        console.log('user', user);
        console.log('err', err);

        return res.json(user);
      });
  } else {
    console.log('returning user', req.user);
    return res.json(req.user || null);
  }
};


/**
 * Login a user with an email-address and send a token
 */
exports.login = function(req,res,next){

  var email = req.body.email;
  // Check if email-address is registered
  User.findOne({'email': email}, function(err,user){
    if (err) {
      res.json({ status: 'error', error: err });
    } else if(!user){
      res.json({ status: 'error', error: 'User not found' });
    } else {

      // User found, create a new token
      var token = new Token();
      token.user = user._id;
      token.save(function(err) { if (err) { res.json({ status: 'error', error: err }); } });

      // Send the new token by email
      mandrill_client.messages.send({
        'message': {
          'html': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
          'text': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
          'subject': 'Login at Columby',
          'from_email': 'admin@columby.com',
          'from_name': 'Columby Admin',
          'to': [{
            'email': user.email,
            'name': user.name,
            'type': 'to'
          }],
          'headers': {
            'Reply-To': 'admin@columby.com'
          },
        }
      }, function(result){
        if (result[0].status === 'sent') {
          res.json({ status: 'success', statusMessage: 'VerificationToken sent.' });
        } else {
          res.json({ status: 'error', err: 'Error sending mail.' });
        }
      });
    }
  });
};


exports.verify = function(req,res,next) {

  var loginToken = req.query.token;

  // Check if supplied token exists
  Token.findOne({'token': loginToken}, function(err,t){
    if (err || !t) {
      return res.json({
        status: 'error',
        statusMessage: 'Error finding the verification token. ',
        error: err
      });
    } else {

      // delete the token
      Token.remove({'token': loginToken}, function(err){
        if (err) { console.log ('Token remove error', err); }
      });

      // fetch user and login
      User.findOne({_id:t.user}, function(err,user){

        // Create a new JWT
        var expires = moment().add(7, 'days').valueOf();

				var token = jwt.encode({
						iss: user._id,
						exp: expires
            },
					  config.jwt.secret
				);

        return res.json({
          status: 'success',
          user: user,
          token : token,
          expires : expires
        });
      });
    }
  });
};


/**
 * Logout
 */
exports.signout = function(req, res) {
  res.json(200,{
    status: 'success',
    statusMessage: 'Successfully logged out. '
  });
};



/**
 * Create a new user
 */
exports.create = function(req, res, next) {
  console.log('Creating new user with specs: ', req.body);

  var user = new User(req.body);
      user.roles = ['authenticated'];

  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('name', 'Name cannot be more than 20 characters').len(1, 20);

  var errors = req.validationErrors();
  if (errors) {
    res.json({ status: 'error', err: errors });
  } else {

    user.save(function(err) {
      if (err) {
        res.json({ status: 'error', err: err });
      } else {

        console.log('Creating token');
        var token = new Token({user: user._id});
            token.save();
            console.log('Token created.', token);

        console.log('Creating publication account');
        var account = new Account({
              owner: user._id,
              name: req.body.name,
              primary: true
            });
            account.save();
            console.log('Account created.', account);

        //sendmail
        mandrill_client.messages.send({
          'message': {
            'html': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
            'text': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
            'subject': 'Login at Columby',
            'from_email': 'admin@columby.com',
            'from_name': 'Columby Admin',
            'to': [{
              'email': user.email,
              'name': user.name,
              'type': 'to'
            }],
            'headers': {
              'Reply-To': 'admin@columby.com'
            },
          }
        }, function(result){
          if (result[0].status === 'sent') {
            res.json({
              status: 'success',
              statusMessage: 'VerificationToken sent.'
            });
          } else {
            res.json({
              status: 'error',
              statusCode: 400,
              statusMessage: 'Error sending mail.',
              error: result
            });
          }
        });
      }
    });
  }
};
