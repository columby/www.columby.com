'use strict';

/**
 * Dependencies
 *
 * @type {exports}
 */
var express = require('express'),
    controller = require('./../controllers/user.controller'),
    auth = require('./../controllers/auth.controller'),
    permission = require('./../permissions/user.permission'),
    router = express.Router();


module.exports = function(app) {


  /**
   * Show a user accounts
   *
   **/
  router.get('/:slug',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canShow,
    controller.show
  );

  /**
   *
   * Update an existing user account
   *
   */
  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canUpdate,
    controller.update
  );

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canDelete,
    controller.delete
  )


  /**
   * Apply the routes to our application
   *
   */
  app.use('/v2/user/', router);

};
