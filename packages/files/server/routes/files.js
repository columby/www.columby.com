'use strict';

var files = require('../controllers/files');

module.exports = function(Files, app, auth, database) {

  app.route('/api/v2/files')
    // Get a list of files
    .get(auth.jwtCheckAccount,files.all);
    //.post(auth.jwtCheckAccount, files.create);

  // Sign a request for direct to S3 uploading
  app.get('/api/v2/files/sign', auth.jwtCheckAccount, files.sign);

  // Success handler when uploading via the browser is complete
  app.post('/api/v2/files/s3success', auth.jwtCheckAccount, files.handleS3success);

  app.route('/api/v2/files/:id')
    // Get information for a specific file
    .get(files.show)
    // Update a file-reference in the database
    .put(auth.jwtCheckAccount, files.update)
    // delete a file from s3 and the database
    .delete(auth.jwtCheckAccount, files.destroy);

  app.param('id', files.file);
};
