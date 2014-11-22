'use strict';

var express = require('express');
var controller = require('./../controllers/admin.controller.js');

var router = express.Router();

router.get( '/user/check-primary-accounts', controller.userAccounts );

module.exports = router;
