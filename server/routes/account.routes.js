'use strict';

var express = require('express'),
    controller = require('./../controllers/account.controller'),
    router = express.Router();

module.exports = function(app) {
  router.get('/', controller.index);
  router.get('/:id', controller.show);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  //router.patch('/:id'    , controller.update);
  //router.delete('/:id'   , controller.destroy);

  app.use('/api/v2/account', router);
};
