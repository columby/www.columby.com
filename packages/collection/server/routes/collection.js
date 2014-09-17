'use strict';

var collection = require('../controllers/collection');

module.exports = function(Collection, app, auth, database) {

  // Article authorization helpers
  var hasAuthorization = function(req, res, next) {
    if (req.collection.owner.id !== req.user.account.id) {
      console.log('User not authorized to edit this dataset');
      return res.status(401).send('User is not authorized');
    }
    next();
  };

  app.route('/api/v2/collection')
    .get(collection.all)
    .post(auth.jwtCheckAccount, collection.create);

  app.route('/api/v2/collection/:collectionId')
    .get(collection.show)
    .put(auth.jwtCheckAccount, hasAuthorization, collection.update)
    .delete(hasAuthorization, collection.destroy);


  app.param('collectionId', collection.collection);
};
