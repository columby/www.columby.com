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
  console.log('returning user', req.user);
  return res.json(req.user || null);
};


exports.passwordlessLogin = function(req,res,next){

  var email = req.body.email;
  // Check if email-address is registered
  User.findOne({'email': email}, function(err,user){
    if (err) {
      res.json(200, {
        status: 'error',
        error: err
      });
      console.log('error: ', err);
    } else if(!user){
      res.json({
        status: 'error',
        error: 'User not found'
      });
      console.log('User not found.');
    } else {
      console.log('User found: ', user);
      // User found, create a new token
      var token = new Token();
      token.user = user._id;
      token.save(function(err){
        if (err){
          console.log('error',err);
          res.json(401,{'error': err});
        }
      });
      console.log('token created', token);

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
  //req.logout();
  //res.redirect('/');
  res.json(200,{
    status: 'success',
    statusMessage: 'Successfully logged out. '
  });
};



/**
 * Create user
 */
exports.create = function(req, res, next) {
  console.log('user check', req.body);

  var user = new User(req.body);
      user.roles = ['authenticated'];

  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('name', 'Name cannot be more than 20 characters').len(1, 20);

  var errors = req.validationErrors();
  if (errors) {
    res.json({
      status: 'error',
      statusCode: 400,
      statusMessage: errors
    });
  } else {

    user.save(function(err) {
      console.log('user after save', user);
      if (err) {
        console.log('Saving user error:', err);
        switch (err.code) {
          case 11000:
            res.json({
              status: 'error',
              statusCode: 400,
              statusMessage: [{
                msg: 'Email already taken',
                param: 'email'
              }]
            });
            break;
          case 11001:
            res.json({
              status: 'error',
              statusCode: 400,
              statusMessage: [{
                msg: 'Name already taken',
                param: 'name'
              }]
            });
            break;
          default:
            var modelErrors = [];

            if (err.errors) {

              for (var x in err.errors) {
                modelErrors.push({
                  param: x,
                  msg: err.errors[x].message,
                  value: err.errors[x].value
                });
              }
              res.json({
                status: 'error',
                statusCode: 400,
                statusMessage: modelErrors
              });
            }
        }

      } else {

        // Create a new loginToken
        var token = new Token({
          user: user._id
        });
        token.save();
        console.log('token created', token);

        // Create a new Account
        var account = new Account({
          owner: user._id,
          name: req.body.name,
          primary: true
        });

        account.save();
        console.log('account created', account);

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
