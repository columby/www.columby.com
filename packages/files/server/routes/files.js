'use strict';

var files = require('../controllers/files');

module.exports = function(Files, app, auth, database) {

  app.route('/api/v2/files')
    .get(auth.jwtCheckAccount,files.all)
    .post(auth.jwtCheckAccount, files.create);

  app.post('/api/v2/files/s3handler', auth.jwtCheckAccount, files.handleS3);
  app.post('/api/v2/files/s3success', auth.jwtCheckAccount, files.handleS3success);

  app.route('/api/v2/files/:id')
    .get(files.show)
    .put(auth.jwtCheckAccount, files.update)
    .delete(auth.jwtCheckAccount, files.destroy);

  app.param('id', files.file);
};


// config the uploader
// var options = {
//     tmpDir:  __dirname + '/../public/uploaded/tmp',
//     uploadUrl:  '/uploaded/files/',
//     maxPostSize: 11000000000, // 11 GB
//     minFileSize:  1,
//     maxFileSize:  10000000000, // 10 GB
//     acceptFileTypes:  /.+/i,
//     // Files not matched by this regular expression force a download dialog,
//     // to prevent executing any scripts in the context of the service domain:
//     inlineFileTypes:  /\.(gif|jpe?g|png)$/i,
//     imageTypes:  /\.(gif|jpe?g|png)$/i,
//     imageVersions: {
//         width:  80,
//         height: 80
//     },
//     accessControl: {
//         allowOrigin: '*',
//         allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
//         allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
//     },
//     storage: {
//       type: 'aws',
//       aws: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'aa',
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 's',
//         bucketName: process.env.AWS_S3_BUCKET || 'aa'
//       }
//     }
// };
