'use strict';

var _ = require('lodash'),
    User = require('./user.model'),
    Token = require('./token.model'),
    Account = require('../account/account.model'),

    config = require('../../config/environment'),

    auth = require('../../components/auth/index'),
    emailService = require('../../email/index');





// Provide the currently logged in user details
exports.me = function(req, res) {
  User.findOne({_id: req.jwt.sub})
    .populate('accounts', 'name slug plan roles avatar')
    .exec(function(err, user) {
      if(err) { return handleError(res,err); }
      var output = {
        user:user
      };
      if (req.jwt.accountId){
        var idx = _.chain(user.accounts).pluck('_id').flatten().value().toString().indexOf(req.jwt.accountId);
        if (idx !== -1) {
          output.selectedAccount = idx;
          console.log(user.selectedAccount);
          console.log('user', user);
        }
      }
      return res.json(output);
    });
}

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
  console.log('Registering a new user', req.body);
  User.create(req.body, function(err, user) {
    if (err) {
      return res.json(err);
      //return handleError(res, err);
    }

    // console.log('Creating a login token for the new user.');
    // var token = new Token({user: user._id});
    // token.save();

    console.log('Creating new primary publication account for the new user.');
    var account = new Account({
      owner   : user._id,
      name    : req.body.name,
      slug    : user.email,
      primary : true
    });
    account.save()

    var vars={
      //tokenurl: req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
      user:{
        email: user.email,
        name: user.name
      }
    }
    // Send email to user with login link.
    //console.log(email.register);
    emailService.preRegister(vars, function(result){
      console.log(result);
      if (result[0].status === 'sent') {
        return res.json(user._id);
      } else {
        return handleError(res, { status: 'error', err: 'Error sending mail.' });
      }
    });


    // emailService.register(vars, function(result){
    //   console.log(result);
    //   if (result[0].status === 'sent') {
    //     return res.json(user._id);
    //   } else {
    //     return handleError(res, { status: 'error', err: 'Error sending mail.' });
    //   }
    // });
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
      var vars = {
        tokenurl: req.protocol + '://' + req.get('host') + '/u/signin?token=' + token.token,
        user: {
          email: user.email,
          name: user.name
        }
      }
      console.log('var', vars);
      emailService.login(vars, function(result){
        console.log('result', result);
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
      .findOne({_id: token.user})
      .exec(function(err,user){

        if (err) { return handleError(res,err); }
        if (!user) { return res.json(user)}

        // Make user verified
        if (user.verified === false){
          user.verified=true;
          user.save();
        }

        var u=user;
        u.selectedAccount = 0;
        var token = auth.createToken(user);
        console.log('Verify complete, token created. ', token);

        return res.json({
          user  : user,
          token : token
        });
      })
    }
  );
}


function handleError(res, err) {
  console.log('User Controller error:', err);
  return res.send(500, err);
}
