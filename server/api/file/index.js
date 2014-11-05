'use strict';

var express = require('express');
var controller = require('./file.controller');
var auth = require('../../components/auth/index');

var router = express.Router();

router.get('/sign'  , auth.checkJWT, controller.sign);
router.post('/s3success', auth.checkJWT, controller.handleS3Success);

router.get('/'      , controller.index);
router.get('/:id'   , controller.show);
router.post('/'     , auth.checkJWT, controller.create);
router.put('/:id'   , auth.checkJWT, controller.update);
router.delete('/:id', auth.checkJWT, controller.destroy);

module.exports = router;
