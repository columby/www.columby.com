'use strict';

var _ = require('lodash'),
    User = require('./user.model'),
    Token = require('./token.model'),
    Account = require('../account/account.model'),

    moment = require('moment'),
    jwt = require('jwt-simple'),
    mandrill = require('mandrill-api/mandrill'),
    config = require('../../config/environment'),

    email = require('../../email/index');
;


// Provide the currently logged in user details
exports.me = function(req,res,id){

  // check jwt
  if (req.headers && req.headers.authorization){
    var token;
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

    if (decoded.exp <= Date.now()) {
      console.log('Access token has expired');
      //res.status(401).json('Access token has expired');
    }

    // get id from jwt
    User.findOne({_id: decoded.iss})
      .populate('accounts')
      .exec(function(err, user) {
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
  User.findOne({_id: req.params.id}, function (err, user) {
    console.log('user', user);
    if(err) { return handleError(res, err); }
    return res.json(user);
  });
};

// Creates a new user in the DB.
exports.register = function(req, res) {
  console.log('Registerein a new user', req.body);
  User.create(req.body, function(err, user) {
    if(err) { return handleError(res, err); }

    console.log('Creating a login token for the new user.');
    var token = new Token({user: user._id});
    token.save();

    console.log('Creating new primary publication account for the new user.');
    var account = new Account({
      owner   : user._id,
      name    : req.body.name,
      slug    : user.email,
      primary : true
    });
    account.save()

    var vars={
      tokenurl: req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
      user:{
        email: user.email,
        name: user.name
      }
    }
    // Send email to user with login link.
    //console.log(email.register);
    email.register(vars, function(result){
      console.log(result);
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


exports.seed = function(res,err){
  console.log('Removing and updating users');
  // Delete all existing users
  User.find({}).remove(function() {
    // Delete all existing accounts
    Account.find({}).remove(function(){
      // Get the list of users
      var u = require('../../seed/users');
      // Create each user
      for (var i=0; i<u.length; i++){
        var newUser = u[i];
        newUser.drupal = {
          uid: newUser.uid,
          uuid: newUser.uuid,
          name: newUser.name
        };
        delete newUser.uid;
        delete newUser.uuid;
        User.create(newUser, function (err, user){
          console.log(user);
          // Create an account for each user
          //console.log(user);
          Account.create({
             owner   : user._id,
             name    : user.drupal.name,
             slug    : user.drupal.name,
             primary : true
          }, function (err,account){
             if (err) { console.log('err', err); }
             //console.log('acount', account);
          });

        });
      }

      console.log('removed Users');
    });
  });
}

function handleError(res, err) {
  return res.send(500, err);
}