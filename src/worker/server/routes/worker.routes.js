'use strict';

var express = require('express'),
    jobCtrl = require('./../controllers/job.controller.js'),
    auth    = require('./../controllers/auth.controller.js'),
    router  = express.Router();


module.exports = function(app) {

  // get job listing
  router.get('/',
    auth.validateJWT,
    auth.validateUser,
    //workerPerm.canView,
    jobCtrl.home
  );

  router.get('/status',
    auth.validateJWT,
    jobCtrl.status
  );

  router.get('/stats',
    auth.validateJWT,
    jobCtrl.stats
  );

  app.use('/api', router);

};
