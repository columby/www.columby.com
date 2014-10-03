'use strict';

var datasets = require('../controllers/datasets');

module.exports = function(Dataset, app, auth, database) {

  // Check if the logged in user has an account that can edit the desired dataset
  var hasAuthorization = function(req, res, next) {
    console.log(req.user.accounts);
    console.log(req.dataset.account._id);
    console.log(req.user.accounts.indexOf(req.dataset.account._id));

    if (req.user.accounts.indexOf(req.dataset.account._id) === -1) {
      console.log('User not authorized to edit this dataset');
      return res.status(401).send('User is not authorized');
    }
    next();
  };

  app.route('/api/v2/dataset/autosave')
    .put(datasets.autosave);

  app.route('/api/v2/dataset')
    .get(datasets.all)
    .post(auth.jwtCheckAccount, datasets.create);

  app.route('/api/v2/dataset/:datasetId')
    .get(datasets.show)
    .put(auth.jwtCheckAccount, hasAuthorization, datasets.update)
    .delete(auth.jwtCheckAccount, hasAuthorization, datasets.destroy);

  app.route('/api/v2/dataset/:datasetId/source')
    .get(datasets.listSources)
    .post(auth.jwtCheckAccount, datasets.createSource);

  app.route('/api/v2/dataset/:datasetId/source/:sourceId')
    .get(datasets.getSource)
    .put(auth.jwtCheckAccount, hasAuthorization, datasets.updateSource)
    .delete(auth.jwtCheckAccount, hasAuthorization, datasets.destroySource);

  app.route('/api/v2/dataset/:datasetId/reference')
    .get(datasets.listReferences)
    .post(auth.jwtCheckAccount, datasets.createReference);

  app.route('/api/v2/dataset/:datasetId/reference/:referenceId')
    .get(datasets.getReference)
    .put(auth.jwtCheckAccount, hasAuthorization, datasets.updateReference)
    .delete(auth.jwtCheckAccount, hasAuthorization, datasets.destroyReference);

  app.param('datasetId', datasets.dataset);
};
