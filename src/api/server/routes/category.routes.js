'use strict';

var express = require('express'),
    controller = require('../controllers/category.controller'),
    permission = require('../permissions/category.permission'),
    auth = require('../controllers/auth.controller'),
    models = require('../models/index'),
    router = express.Router();



module.exports = function(app){

  router.get('/', controller.index);

  router.get('/:id', controller.show);

  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canCreate,
    controller.create);

  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canUpdate,
    controller.update);

  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canDelete,
    controller.destroy);

  router.get('/:id/datasets',
    controller.getDatasets
  );

  router.post('/:id/addDataset',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canUpdate,
    controller.addDataset
  );
  router.post('/:id/removeDataset',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    permission.canUpdate,
    controller.removeDataset
  );

  app.use('/v2/category',router);
};
