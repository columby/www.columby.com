'use strict';

var express = require('express'),
    controller = require('./../controllers/file.controller'),
    auth = require('./../controllers/auth.controller'),
    perm = require('./../permissions/file.permission'),
    router = express.Router();


module.exports = function(app) {

  router.post('/sign',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    perm.canUpload,
    controller.sign
  );

  router.post('/finish-upload',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    controller.finishUpload
  );

  router.get('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    controller.index);

  router.get('/:id',
    controller.show);

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    perm.canUpdate,
    controller.update);

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    perm.canDelete,
    controller.delete);

  app.use('/v2/file', router);
};
