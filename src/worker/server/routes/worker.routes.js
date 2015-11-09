'use strict';

var express = require('express'),
    jobCtrl = require('./../controllers/job.controller.js'),
    auth    = require('./../controllers/auth.controller.js'),
    router  = express.Router();


module.exports = function(app) {

  // get job listing
  router.get('/',
    auth.checkJWT,
    auth.checkUser,
    //workerPerm.canView,
    jobCtrl.home
  );

  router.get('/status',
    auth.checkJWT,
    jobCtrl.status
  );

  router.get('/stats',
    auth.checkJWT,
    jobCtrl.stats
  );

  app.use('/api', router);

};
