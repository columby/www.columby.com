'use strict';

var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.post('/login'   , controller.login);
router.post('/register', controller.register);
router.get( '/verify'  , controller.verify);
router.post('/me'      , controller.me);
// router.get('/logout'  , controller.signout);

router.get( '/'        , controller.index);
router.get( '/:id'     , controller.show);
router.post('/'        , controller.register);
router.put( '/:id'     , controller.update);
//router.patch('/:id'    , controller.update);
//router.delete('/:id'   , controller.destroy);

module.exports = router;
