'use strict';

var express = require('express');
var controller = require('./../controllers/file.controller');
var auth = require('./../controllers/auth.controller');

var router = express.Router();

router.get('/sign'  , auth.ensureAuthenticated, controller.sign);
router.post('/s3success', auth.ensureAuthenticated, controller.handleS3Success);

router.get('/'      , controller.index);
router.get('/:id'   , controller.show);
router.post('/'     , auth.ensureAuthenticated, controller.create);
router.put('/:id'   , auth.ensureAuthenticated, controller.update);
router.delete('/:id', auth.ensureAuthenticated, controller.destroy);

module.exports = router;
