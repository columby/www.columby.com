'use strict';

var datasets = require('../controllers/datasets');

module.exports = function(Dataset, app, auth, database) {

  // Article authorization helpers
  var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && req.dataset.user.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  };

  app.route('/api/v2/dataset/autosave')
    .put(datasets.autosave);

  app.route('/api/v2/dataset')
    .get(datasets.all)
    .post(auth.requiresLogin, datasets.create);

  app.route('/api/v2/dataset/:datasetId')
    .get(datasets.show)
    .put(auth.requiresLogin, hasAuthorization, datasets.update)
    .delete(auth.requiresLogin, hasAuthorization, datasets.destroy);



  app.param('datasetId', datasets.dataset);
};
