/************************
 *
 * Routes to handle API requests dealing with primary sources
 *
 ************************/

'use strict';

var express = require('express'),
  primaryCtrl = require('../controllers/primary.controller'),
  primaryPerms = require('../permissions/primary.permission'),
  auth = require('../controllers/auth.controller'),
  router = express.Router();


module.exports = function(app){

  // Get a list of primary sources
  router.get('/',
    primaryCtrl.index
  );

  // Create a new primary source for a dataset with existing distribution
  router.post('/',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canCreate,
    primaryCtrl.create
  );

  // Get a spicific primary source
  router.get('/:id',
    primaryCtrl.show
  );

  //
  router.post('/convert',
    primaryPerms.canConvert,
    primaryCtrl.convert
  );

  // Synchronize a primary source with the remote source
  router.post('/:id/sync',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canUpdate,
    primaryCtrl.sync
  );

  // Update an existing primary source
  router.put('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canUpdate,
    primaryCtrl.update
  );

  // Delete an existing primary source
  router.delete('/:id',
    auth.checkJWT,
    auth.checkUser,
    auth.ensureAuthenticated,
    primaryPerms.canDelete,
    primaryCtrl.destroy
  );

  // Add the routes to the app-router
  app.use('/v2/primary', router);
  
};
