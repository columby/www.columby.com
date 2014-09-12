'use strict';

module.exports = function(Account, app, auth, database) {

  // User routes use users controller
  var account = require('../controllers/account');

  // Account of currently loggedin user
  app.route('/api/v2/user/account')
    .get(auth.jwtCheckAccount, account.account)
    .put(account.updateAccount);
};
