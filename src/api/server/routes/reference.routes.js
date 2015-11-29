'use strict';

var express = require('express'),
    referenceCtrl = require('../controllers/reference.controller'),
    referencePerms = require('../permissions/reference.permission'),
    auth = require('../controllers/auth.controller'),
    router = express.Router();


module.exports = function(app){


  // Reference Routes
  router.get('/',
    referenceCtrl.index);

  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    referencePerms.canCreate,
    referenceCtrl.create);

  router.get('/:id',
    referenceCtrl.get);

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    referencePerms.canUpdate,
    referenceCtrl.update);

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    referencePerms.canDelete,
    referenceCtrl.destroy);


  app.use('/v2/reference',router);

};
