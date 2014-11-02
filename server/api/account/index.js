'use strict';

var express = require('express'),
    controller = require('./account.controller')
;

var router = express.Router();

router.get('/seed'     , controller.seed);

router.get('/'         , controller.index);
router.get('/:id'      , controller.show);
router.post('/'        , controller.create);
router.put('/:id'      , controller.update);
//router.patch('/:id'    , controller.update);
//router.delete('/:id'   , controller.destroy);

module.exports = router;
