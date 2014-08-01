'use strict';
//var mongoose = require('mongoose'),
  //User = mongoose.model('User');
  //passwordless = require('passwordless');

// The Package is past automatically as first parameter
module.exports = function(Columby, app, auth, database) {


  /* POST login details. */
  /*
  app.post('/api/user/sendtoken',
    // Input validation
    function(req,res,next){
      console.log('Checking input');
      req.checkBody('user', 'Please provide a valid email address').isLength(1,200).isEmail();
      req.sanitize('user').toLowerCase();
      req.sanitize('user').trim();

      var errors = req.validationErrors(true);
      if(errors){
        req.flash('validation',errors);
        res.json({
          status: 'error',
          statusCode: 1,
          statusMessage: 'There were validation errors.',
          errors: errors
        });
      } else {
        console.log('no validation errors found.');
        // Check if user exists
        console.log('fetching user: ' + req.body.user);
        User.findOne({email: req.body.user}, function(err,user){
          if (err) {
            console.log('error');
            console.log(err);
            res.json({
              status: 'error',
              statusCode: 3,
              statusMessage: 'Error fetching from database',
              error: err
            });
          } else if (!user) {
            console.log('No user found');
            res.json({
              status: 'error',
              statusCode: 2,
              statusMessage: 'User ' + req.body.user + ' not found'
            });
          } else {
            console.log('user: ');
            console.log(user);
            next();
          }
        });
      }
    },
    // User is found, get the token and send it.
    passwordless.requestToken(
      function(email, delivery, callback) {
        console.log('checking user: ' + email);
        // return user if exists, create new if not
        User.findOne({email: email}, function(err, user) {
          if (err) {
            console.log('error');
            console.log(err);
            callback(err.toString());
          } else if(user) {
            console.log(user);
            callback(null,user.id);
          } else {
            console.log('user not found');
            //User.createOrUpdateUser(email)
            //callback('user not found');
            callback(null,null);
          }
        });
      }, {
        succesFlash:'bla'
        //failureRedirect: '#!/signin',
        //failureFlash: 'We had issues sending out this email... Could you try it at a later moment?',
				//successFlash: 'You should have an email in your inbox any minute now...!'
      }), function(req, res) {
        res.json({
          status: 'success',
          statusMessage: 'You should have an email in your inbox any minute now...!'
        });
      }
  );

  app.post('/api/user/register',
    // Input validation
    function(req,res,next){
      console.log('Starting registration. ');

      req.checkBody('user', 'Please provide a valid email address').isLength(1,200).isEmail();
      req.sanitize('user').toLowerCase();
      req.sanitize('user').trim();
      req.checkBody('username', 'Please provide a valid username').isLength(1,50);
      req.sanitize('username').toLowerCase();
      req.sanitize('username').trim();

      var newuser = {};
          newuser.email = req.body.user;
          newuser.username = req.body.username;
      console.log(newuser);


      var errors = req.validationErrors(true);
      if (errors) {
        console.log(errors);
        //req.flash('validation',errors);
        res.json({
          status: 'error',
          statusCode: 1,
          statusMessage: 'There were validation errors.',
          errors: errors
        });
      } else {
        // Create the new user
        console.log('registering new user: ' + newuser.email + ', ' + newuser.username);
        var newUser = new User(newuser);
        newUser.save(function(err){
          if (err) {
            console.log('error');
            console.log(err);
            //req.flash('save',err);
            res.json({
              status: 'error',
              statusCode: 3,
              statusMessage: 'Error saving new user.',
              error: err
            });
          } else {
            console.log('User created: ');
            console.log(newUser);
            //req.newUser = newUser;
            next();
          }
        });
      //next();
      }
    },

    // Send the token
    passwordless.requestToken(
      function(email, delivery, callback) {
        console.log('requesting token after registration');
        console.log(email);
        // return user if exists, create new if not
        //callback(null, email);

        User.findOne({email: email}, function(err, user) {
          if (err) {
            console.log(err);
            callback(err.toString());
          } else if(user) {
            console.log(user);
            console.log(user.id);
            callback(null,user.id);
          } else {
            console.log('no user');
            //User.createOrUpdateUser(email)
            //callback('user not found');
            callback(null,null);
          }
        });

      },{
        //failureRedirect: '/',
        //failureFlash: 'We had issues sending out this email... Could you try it at a later moment?',
        successFlash: 'You should have an email in your inbox any minute now...!'

      }), function(req, res) {
        console.log(req);
        console.log('finished');
        res.json({
          status: 'success',
          statusMessage: 'You should have an email in your inbox any minute now...!'
        });
      }
  );

  */
  /*
  app.get('/columby/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/columby/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/columby/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/columby/example/render', function(req, res, next) {
    Columby.render('index', {
      package: 'columby'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
  */
};
