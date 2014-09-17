'use strict';

// User routes use users controller
var accounts = require('../controllers/accounts');

module.exports = function(Accounts, app, auth, database) {

  // Account of currently loggedin user
  app.route('/api/v2/account/:slug')
    .get(auth.jwtCheckAccount, accounts.account)
    .put(accounts.update);

  app.route('/api/v2/account')
    .get(accounts.index)
    .post(accounts.create);

};
