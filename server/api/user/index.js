'use strict';

var express = require('express'),
    controller = require('./user.controller'),
    auth = require('../../components/auth/index');

var router = express.Router();

router.post('/login'   , controller.login);
router.post('/register', controller.register);
router.get( '/verify'  , controller.verify);
router.post('/me'      , controller.me);
router.post('/config'  , controller.getConfig);
// router.get('/logout'  , controller.signout);

router.get( '/'        , auth.checkJWT, auth.isAdmin, controller.index);
router.get( '/:id'     , controller.show);
router.post('/'        , controller.register);
router.put( '/:id'     , controller.update);
//router.patch('/:id'    , controller.update);
//router.delete('/:id'   , controller.destroy);

module.exports = router;
