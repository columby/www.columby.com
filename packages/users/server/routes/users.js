'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(MeanUser, app, auth, database) {

  // Setting up the userId param
  //app.param('userId', users.user);


  app.route('/api/v2/user/login')
    .post(users.passwordlessLogin);

  app.route('/api/v2/user/register')
    .post(users.create);

  app.route('/api/v2/user/verify')
    .get(users.verify);

  app.route('/api/v2/user/logout')
    .get(users.signout);

  // Profile of currently loggedin user
  app.route('/api/v2/user/profile/:slug')
    .get(users.getProfile);
  app.route('/api/v2/user/profile')
    // check permission
    .put(users.updateProfile);

};
