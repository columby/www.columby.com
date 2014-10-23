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

      //create token url
      var tokenurl = req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token;

      // Send the new token by email
      mandrill_client.messages.sendTemplate({
        'template_name': 'columby-notice-template',
        'template_content' : [{
          'name' : 'Your login token',
          'content' : 'Hi!<br/>There was a request to login. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you did not make this request, just ignore this email.'
        }],
        'message': {
          'html': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
          'text': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
          'subject': 'Login at Columby',
          'from_email': 'noreply@columby.com',
          'from_name': 'Columby',
          'to': [{
            'email': user.email,
            'name': user.name,
            'type': 'to'
          }],
          'headers': {
            'Reply-To': 'noreply@columby.com'
          },
          'merge_vars': [{
            'rcpt' : user.email,
            'vars': [{
              'name':'TITLE',
              'content':'Your login token',
            },{
              'name':'MESSAGE',
              'content':'Hi!<br/>There was a request to login. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you did not make this request, just ignore this email.'
            },{
              'name':'LINK',
              'content': tokenurl
            },{
              'name':'LINKTITLE',
              'content': 'Login at Columby'
            }],
          }],
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
      User
        .findById(t.user)
        .populate('accounts')
        .exec(function(err,user){

          // Create a new JWT
          var expires = moment().add(7, 'days').valueOf();

				  var token = jwt.encode({
						iss: user._id,
						exp: expires
            }, config.jwt.secret);

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

  var user = new User({
    email: req.body.email
  });

  req.assert('email', 'You must enter a valid email address').isEmail();

  var errors = req.validationErrors();
  if (errors) {
    console.log('Error saving', errors);
    res.json({ status: 'error', err: errors });
  } else {

    user.save(function(err) {
      if (err) {
        console.log(err);
        var e;
        if (err.errors.email) {
          e = err.errors.email.message;
        }
        res.json({
          status: 'error',
          error: {
            msg: e
          }
        });
      } else {

        var token = new Token({user: user._id});
            token.save();
            console.log('Token created.', token);

        console.log('Creating publication account');
        var account = new Account({
          owner   : user._id,
          name    : req.body.name,
          slug    : req.body.name,
          primary : true
        });

        account.save();

        var tokenurl = req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token;

        mandrill_client.messages.sendTemplate({
          'template_name': 'columby-notice-template',
          'template_content' : [{
            'name' : 'Welcome to Columby!',
            'content' : 'Hi!<br/>You can log in right away and start using your new account. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you don\'t know what this is about, then someone has probably entered your email address by mistake. Sorry about that.'
          }],
          'message': {
            'html': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
            'text': req.protocol + '://' + req.get('host') + '/#!/u/signin?token=' + token.token,
            'subject': 'Login at Columby',
            'from_email': 'noreply@columby.com',
            'from_name': 'Columby',
            'to': [{
              'email': user.email,
              'name': user.name,
              'type': 'to'
            }],
            'headers': {
              'Reply-To': 'noreply@columby.com'
            },
            'merge_vars': [{
              'rcpt' : user.email,
              'vars': [{
                'name':'TITLE',
                'content':'Welcome to Columby!',
              },{
                'name':'MESSAGE',
                'content':'Hi!<br/>You can log in right away and start using your new account. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you don\'t know what this is about, then someone has probably entered your email address by mistake. Sorry about that.<br><br>Thank you,<br>The Columby team'
              },{
                'name':'LINK',
                'content': tokenurl
              },{
                'name':'LINKTITLE',
                'content': 'Login at Columby'
              }],
            }],
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
