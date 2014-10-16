'use strict';

var files = require('../controllers/files');

module.exports = function(Files, app, auth, database) {

  app.route('/api/v2/files')
    .get(auth.jwtCheckAccount,files.all)
    .post(auth.jwtCheckAccount, files.create);

  app.get('/api/v2/files/sign', auth.jwtCheckAccount, files.sign);

  app.post('/api/v2/files/s3success', auth.jwtCheckAccount, files.handleS3success);

  app.route('/api/v2/files/:id')
    .get(files.show)
    .put(auth.jwtCheckAccount, files.update)
    .delete(auth.jwtCheckAccount, files.destroy);

  app.param('id', files.file);
};
