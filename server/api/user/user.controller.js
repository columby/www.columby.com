'use strict';

var _ = require('lodash'),
    User = require('./user.model'),
    Token = require('./token.model'),
    Account = require('../account/account.model'),

    moment = require('moment'),
    jwt = require('jwt-simple'),
    mandrill = require('mandrill-api/mandrill'),
    config = require('../../config/environment')
;

var mandrill_client = new mandrill.Mandrill(config.mandrill.key);


// Provide the currently logged in user details
exports.me = function(req,res,id){

  // check jwt
  if (req.headers && req.headers.authorization){
    var token;
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

    // get id from jwt
    console.log('user id is ', decoded.iss);
    User.findById(decoded.iss, function(err, user) {
      if(err) { return handleError(res,err); }
      return res.json(user);
    });
  }
}

// Get list of users
exports.index = function(req, res) {
  User.find(function (err, users) {
    if(err) { return handleError(res, err); }
    return res.json(200, users);
  });
};

// Get a single user
exports.show = function(req, res) {
  console.log('fetching user');
  console.log(req.params);
  User.findById(req.params.id, function (err, user) {
    if(err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    return res.json(user);
  });
};

// Creates a new user in the DB.
exports.register = function(req, res) {
  User.create(req.body, function(err, user) {
    if(err) { return handleError(res, err); }

    console.log('Creating token');
    var token = new Token({user: user._id});
    token.save();
    console.log('Token created.', token);

    console.log('creating new primary publication account');
    var account = new Account({
      owner   : user._id,
      name    : user.name,
      slug    : user.email,
      primary : true
    });
    account.save()
    console.log('account', account)

    var tokenurl = req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token;

    mandrill_client.messages.sendTemplate({
      'template_name': 'columby-notice-template',
      'template_content' : [{
        'name' : 'Welcome to Columby!',
        'content' : 'Hi!<br/>You can log in right away and start using your new account. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you don\'t know what this is about, then someone has probably entered your email address by mistake. Sorry about that.'
      }],
      'message': {
        'html': req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
        'text': req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
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
        return res.json(user._id);
      } else {
        return handleError(res, { status: 'error', err: 'Error sending mail.' });
      }
    });
  });
};

// Updates an existing user in the DB.
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

// Deletes a user from the DB.
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


// Login a user with an email-address and send a jwt token back
exports.login = function(req,res,next) {
  var email = req.body.email;

  // Check if email-address is registered
  User.findOne({'email': email}, function(err,user){
    if (err) { return handleError(res, err); }
    if (!user){ return res.send(user); }

    // create a new logintoken
    var token = new Token({user: user._id});

    token.save(function(err) {
      if (err) { return handleError(res,err); }
      // send email
      //create token url
      var tokenurl = req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token;

      // Send the new token by email
      mandrill_client.messages.sendTemplate({
        'template_name': 'columby-notice-template',
        'template_content' : [{
          'name' : 'Your login token',
          'content' : 'Hi!<br/>There was a request to login. Please click the button below to login. <br>Or copy and paste this url:<br>' + tokenurl + '<br><br>If you did not make this request, just ignore this email.'
        }],
        'message': {
          'html': tokenurl,
          'text': tokenurl,
          'subject': 'Login at Columby',
          'from_email': 'noreply@columby.com',
          'from_name': 'Columby',
          'to': [{
            'email': user.email,
            'name': user.email,
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
          return res.json(user._id);
        } else {
          return handleError(res, { status: 'error', err: 'Error sending mail.' });
        }
      });
    });
  });
}


exports.verify = function(req,res,next) {

  var loginToken = req.query.token;

  // Check if supplied token exists
  Token.findOneAndRemove({'token': loginToken}, function(err,token){
    if (err) { return handleError(res,err); }
    if (!token) { return res.json({status:'error',err:'token not found'})}

    User
      .findById(token.user)
      .populate('accounts')
      .exec(function(err,user){

        // Make user verified
        if (user.verified === false){
          user.verified=true;
          user.save();
        }

        // Create a new JWT
        var expires = moment().add(7, 'days').valueOf();

        var token = jwt.encode({
          iss: user._id,
          exp: expires
          }, config.jwt.secret);

        console.log('Verify complete', token);
        return res.json({
          status: 'success',
          user: user,
          token : token,
          expires : expires
        });
      })
    }
  );
}



function handleError(res, err) {
  return res.send(500, err);
}
