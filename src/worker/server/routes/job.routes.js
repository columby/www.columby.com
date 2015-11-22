'use strict';

var express = require('express'),
    jobPerms = require('./../permissions/job.permission.js'),
    jobCtrl = require('./../controllers/job.controller.js'),
    authCtrl    = require('./../controllers/auth.controller.js'),
    router  = express.Router();


module.exports = function(app) {

  router.get('/'        , authCtrl.checkJWT, jobCtrl.index);
  router.get('/:id'     , authCtrl.checkJWT, jobCtrl.show);
  router.get('/:id/log' , authCtrl.checkJWT, jobCtrl.jobLog);

  router.post('/'       , authCtrl.checkJWT, authCtrl.checkUser, jobPerms.canCreate, jobCtrl.create);
  router.put('/:id'     , authCtrl.checkJWT, authCtrl.checkUser, jobPerms.canCreate, jobCtrl.update);
  router.delete('/:id'  , authCtrl.checkJWT, authCtrl.checkUser, jobPerms.canCreate, jobCtrl.destroy);

  app.use('/api/job', router);

};
