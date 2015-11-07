'use strict';

var express = require('express'),
    jobCtrl = require('./../controllers/job.controller.js'),
    auth    = require('./../controllers/auth.controller.js'),
    router  = express.Router();


module.exports = function(app) {

  // get specific job
  router.get('/'        , auth.validateJWT, jobCtrl.index);
  router.get('/:id'    , auth.validateJWT, jobCtrl.show);
  router.get('/:id/log', auth.validateJWT, jobCtrl.jobLog);

  router.post('/'       , auth.validateJWT, jobCtrl.canManage, jobCtrl.create);

  router.put('/:id'    , auth.validateJWT, jobCtrl.canManage, jobCtrl.update);

  router.delete('/:id' , auth.validateJWT, jobCtrl.canManage, jobCtrl.destroy);

  app.use('/api/job', router);

};
