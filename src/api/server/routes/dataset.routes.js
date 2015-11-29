'use strict';

var express = require('express'),
    datasetCtrl = require('../controllers/dataset.controller'),
    datasetPerms = require('../permissions/dataset.permission'),
    auth = require('../controllers/auth.controller'),
    router = express.Router();


module.exports = function(app){


  router.get('/',
    datasetCtrl.index);

  router.get('/:id',
    datasetPerms.canView,
    datasetCtrl.show);

  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canCreate,
    datasetCtrl.create);

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.update);

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canDelete,
    datasetCtrl.destroy);


  // Dataset registry routes
  router.put('/:id/registry/:rid',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.updateRegistry
  );

  // Dataset tags routes
  router.post('/:id/tag',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.addTag);

  router.delete('/:id/tag/:tid',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.removeTag);

  // Dataset categories routes
  router.post('/:id/category',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.addCategory);

  router.delete('/:id/category/:cid',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.removeCategory);

  // Distribution Routes
  router.get('/:id/distribution',
    datasetCtrl.listDistributions);

  router.post('/:id/distribution',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.createDistribution);

  router.get('/:id/distribution/:did',
    datasetCtrl.getDistribution);

  router.put('/:id/distribution/:did',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.updateDistribution);

  router.delete('/:id/distribution/:did',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    datasetPerms.canUpdate,
    datasetCtrl.destroyDistribution);

  app.use('/v2/dataset',router);

};
