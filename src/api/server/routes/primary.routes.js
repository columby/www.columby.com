'use strict';

var express = require('express'),
  primaryCtrl = require('../controllers/primary.controller'),
  primaryPerms = require('../permissions/primary.permission'),
  auth = require('../controllers/auth.controller'),
  router = express.Router();


module.exports = function(app){

  router.get('/',
    primaryCtrl.index);

  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canCreate,
    primaryCtrl.create);

  router.get('/:id',
    primaryCtrl.show);

  router.post('/:id/sync',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canUpdate,
    primaryCtrl.sync);

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canUpdate,
    primaryCtrl.update);

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canDelete,
    primaryCtrl.destroy);

  app.use('/v2/primary', router);
};
