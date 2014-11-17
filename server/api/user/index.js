'use strict';

var express = require('express'),
    controller = require('./user.controller'),
    auth = require('../../components/auth/index');

var router = express.Router();

router.post('/login'   , controller.login);
router.post('/register', controller.register);
router.get( '/verify'  , controller.verify);

router.post('/me'      ,
  auth.ensureAuthenticated,
    controller.me);

router.post('/config'  , controller.config);

router.get( '/'        , auth.ensureAuthenticated, auth.isAdmin, controller.index);

router.get( '/:id'     , controller.show);

// Create a new user
router.post('/'        , controller.register);

router.put( '/:id',
  auth.ensureAuthenticated,
    controller.update
);


module.exports = router;
