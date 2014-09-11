'use strict';

module.exports = function(System, app, auth, database) {

  // Home route
  var index = require('../controllers/index');
  app.route('/')
    .get(auth.jwt, index.render);

};
