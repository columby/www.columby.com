'use strict';

var express = require('express'),
    jobCtrl = require('./../controllers/job.controller.js'),
    auth    = require('./../controllers/auth.controller.js'),
    router  = express.Router();


module.exports = function(app) {

  // get specific job
  router.get('/'        , auth.checkJWT, jobCtrl.index);
  router.get('/:id'    , auth.checkJWT, jobCtrl.show);
  router.get('/:id/log', auth.checkJWT, jobCtrl.jobLog);

  router.post('/'       , auth.checkJWT, jobCtrl.canManage, jobCtrl.create);

  router.put('/:id'    , auth.checkJWT, jobCtrl.canManage, jobCtrl.update);

  router.delete('/:id' , auth.checkJWT, jobCtrl.canManage, jobCtrl.destroy);

  app.use('/api/job', router);

};
