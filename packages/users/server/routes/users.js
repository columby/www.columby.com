'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(MeanUser, app, auth, database, passport) {

  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.route('/loggedin')
    .get(function(req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });

  // Login paths
  app.route('/api/v2/user/passwordless-login')
    .post(users.passwordlessLogin);

  app.route('/api/v2/user/passwordless-register')
    .post(users.create);

  app.route('/api/v2/user/passwordless-verify')
    .get(users.verify);

  app.route('/api/v2/user/logout')
    .get(users.signout);

  app.route('/users/me')
    .get(users.me);

  // Setting up the users api
  /*
  app.route('/api/v2/user/register')
    .post(users.create);

  app.route('/forgot-password')
    .post(users.forgotpassword);

  app.route('/reset/:token')
    .post(users.resetpassword);
  */


  // Setting the local strategy route
  /*
  app.post('/api/v2/user/login', function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json({
          status: 'error',
          errorMessage: info.message
        });
        //return res.redirect('/login');
      }
      // Check if account is validated
      if (user.validated !== true) {
        return res.json({
          status: 'error',
          errorMessage: 'User found, but not validated. Check your email or resend the verification email.'
        });
      }

      req.logIn(user, function(err) {

        if (err) {
          console.log(err);
          return res.json({
            status: 'error',
            statusCode: '',
            statusMessage: 'Error logging in',
            error: err
          });
          //return next(err);
        }
        return res.json({
          status: 'success',
          statusCode: '200',
          statusMessage: 'Successfully logged in',
          user: user
        });
      });
    })(req, res, next);
  });

  // Setting the facebook oauth routes
  app.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the github oauth routes
  app.route('/auth/github')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the twitter oauth routes
  app.route('/auth/twitter')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the google oauth routes
  app.route('/auth/google')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);

  app.route('/auth/google/callback')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the linkedin oauth routes
  app.route('/auth/linkedin')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login',
      scope: ['r_emailaddress']
    }), users.signin);

  app.route('/auth/linkedin/callback')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login'
    }), users.authCallback);
    */
};
