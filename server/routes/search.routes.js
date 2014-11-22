'use strict';

var express = require('express'),
    controller = require('./../controllers/search.controller'),
    auth = require('./../controllers/auth.controller')
;

var router = express.Router();

router.get('/sync',
  //auth.checkJWT,
  //auth.isAdmin,
    controller.sync);

router.get('/', controller.search);

module.exports = router;
