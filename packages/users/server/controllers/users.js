'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  config = require('meanio').loadConfig(),
  mandrill = require('mandrill-api/mandrill'),
  mandrill_client = new mandrill.Mandrill(config.mandrill.key),
  VerificationToken = mongoose.model('VerificationToken')
;

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};


exports.verify = function(req,res,next) {
  console.log(req.query);
  var token = req.query.token;
  console.log('token', token);

  VerificationToken.findOne({'token': token}, function (err, doc){
    console.log(err);
    console.log(doc);
      if (err || !doc) {
        res.json({
          status: 'error',
          statusMessage: 'Error finding the verification token. ',
          error: err
        });
      }
      else {
        User.findOne({_id: doc._userId}, function (err, user) {
          if (err) {
            res.json({
              status: 'error',
              statusMessage: 'Error finding the verification token. ',
              error: err
            });
          } else {
            user.verified = true;
            user.save(function(err) {
              res.json({
                  status: 'success',
                  statusMessage: 'Succesfully verified the account. '
                });
            });
          }
        });
      }
  });
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  //res.redirect('/');
  res.json(200,{
    status: 'success',
    statusMessage: 'Successfully logged out. '
  });
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
  var user = new User(req.body);

  user.provider = 'local';

  // because we set our user.provider to local our models/user.js validation will always be true
  //req.assert('name', 'You must enter a name').notEmpty();
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    res.json(400,{
      status: 'error',
      statusMessage: errors
    });
  }

  // Hard coded for now. Will address this with the user permissions system in v0.3.5
  user.roles = ['authenticated'];
  user.name = user.username;

  user.save(function(err) {
    if (err) {
      console.log(err);
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
              msg: 'Username already taken',
              param: 'username'
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

            res.json(400,{
              status: 'error',
              statusMessage: modelErrors
            });
          }
      }

    } else {
      // Create and send verification-token
      var verificationToken = new VerificationToken({_userId: user._id});
      verificationToken.createVerificationToken(function (err, token) {
        if (err) {
          res.json({'error': err});
        } else {
          //sendmail
          mandrill_client.messages.send({
            'message': {
              'html': req.protocol + '://' + req.get('host') + '/verify/' + token,
              'text': req.protocol + '://' + req.get('host') + '/verify/' + token,
              'subject': 'Validate your account at Columby',
              'from_email': 'admin@columby.com',
              'from_name': 'Columby Admin',
              'to': [{
                'email': 'arn@urbanlink.nl',
                'name': 'avdp',
                'type': 'to'
              }],
              'headers': {
                'Reply-To': 'admin@columby.com'
              },
            }
          }, function(result){
            if (result[0].status === 'sent') {
              res.json(200,{
                status: 'success',
                statusMessage: 'VerificationToken sent.'
              });
            } else {
              res.json(400,{
                status: 'error',
                statusMessage: 'Error sending mail.',
                error: result
              });
            }

          });
        }
      });
      //res.json(token);
    }
  });
};
/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user,
        });
      });
    });
  });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
  mandrill_client.messages.send({
    'message': {
      'html': '<p>Example HTML content</p>',
      'text': 'Example text content',
      'subject': 'example subject',
      'from_email': 'admin@columby.com',
      'from_name': 'Columby Admin',
      'to': [{
        'email': 'arn@urbanlink.nl',
        'name': 'avdp',
        'type': 'to'
      }],
      'headers': {
        'Reply-To': 'admin@columby.com'
      },
    }
  }, function(result){
    console.log(result);
  });

  var transport = nodemailer.createTransport('SMTP', config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}


//sendMail();

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
  async.waterfall([

      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          $or: [{
            email: req.body.text
          }, {
            username: req.body.text
          }]
        }, function(err, user) {
          if (err || !user) return done(true);
          done(err, user, token);
        });
      },
      function(user, token, done) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
        sendMail(mailOptions);
        done(null, true);
      }
    ],
    function(err, status) {
      var response = {
        message: 'Mail successfully sent',
        status: 'success'
      };
      if (err) {
        response.message = 'User does not exist';
        response.status = 'danger';
      }
      res.json(response);
    }
  );
};
