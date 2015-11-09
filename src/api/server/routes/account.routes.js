'use strict';

var express = require('express'),
    controller = require('./../controllers/account.controller'),
    permission = require('./../permissions/account.permission'),
    auth = require('./../controllers/auth.controller'),
    router = express.Router();



module.exports = function(app) {

  router.get('/',
    auth.checkJWT,
    controller.index
  );

  router.get('/:slug',
    auth.checkJWT,
    auth.checkUser,
    controller.show
  );

  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canCreate,
    controller.create
  );

  router.post('/:id/addFile',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canEdit,
    controller.addFile
  );

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    permission.canEdit,
    controller.update
  );

  router.put('/:id/registry/:rid',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canEdit,
    controller.updateRegistry
  );

  router.post('/:id/defaultcategories',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canEdit,
    controller.addDefaultCategories
  );

  app.use('/v2/account', router);

};
