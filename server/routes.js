/**
 * Main application routes
 */

'use strict';

var errors = require('./controllers/errors.controller');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v2/collection', require('./routes/collection.routes'));
  app.use('/api/v2/file', require('./routes/file.routes'));
  app.use('/api/v2/admin', require('./routes/admin.routes'));
  app.use('/api/v2/search', require('./routes/search.routes'));
  app.use('/api/v2/account', require('./routes/account.routes'));
  app.use('/api/v2/user', require('./routes/user.routes'));
  app.use('/api/v2/dataset', require('./routes/dataset.routes'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
