'use strict';

var express = require('express'),
    controller = require('./search.controller'),
    auth = require('../../components/auth/index')
;

var router = express.Router();

router.get('/sync',
  auth.checkJWT,
  auth.isAdmin,
    controller.sync);

router.get('/', controller.search);

module.exports = router;
