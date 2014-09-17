'use strict';

// config the uploader
var options = {
    tmpDir:  __dirname + '/../public/uploaded/tmp',
    uploadUrl:  '/uploaded/files/',
    maxPostSize: 11000000000, // 11 GB
    minFileSize:  1,
    maxFileSize:  10000000000, // 10 GB
    acceptFileTypes:  /.+/i,
    // Files not matched by this regular expression force a download dialog,
    // to prevent executing any scripts in the context of the service domain:
    inlineFileTypes:  /\.(gif|jpe?g|png)$/i,
    imageTypes:  /\.(gif|jpe?g|png)$/i,
    imageVersions: {
        width:  80,
        height: 80
    },
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
    },
    storage: {
      type: 'aws',
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'aa',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 's',
        bucketName: process.env.AWS_S3_BUCKET || 'aa'
      }
    }
};

var uploader = require('blueimp-file-upload-expressjs')(options);


module.exports = function (Files, app, auth, database) {
  app.route('/file/upload')
    .get(function(req, res) {
      uploader.get(req, res, function (obj) {
        res.send(JSON.stringify(obj));
      });
    });

  app.route('/file/post').post(function(req, res) {
      uploader.post(req, res, function (obj) {
        res.send(JSON.stringify(obj));
      });
    });

  app.route('/file/uploaded/files/:name')
    .delete(function(req, res) {
      uploader.delete(req, res, function (obj) {
        res.send(JSON.stringify(obj));
      });
    });
};


/*
var files = require('../controllers/files');



var canPublish = function(req,res,next){
  console.log('can publish');
  next();
};


// The Package is past automatically as first parameter
module.exports = function(Files, app, auth, database) {

  app.param('id', files.file);

  app.route('/api/v2/file')
    .post(canPublish, files.create);

  app.route('/api/v2/file/:id')
    .get(files.signMultipartUpload);

  /*
  app.route('/api/v2/file/signFile').post(canPublish, files.upload);
  app.route('/api/v2/file/signMultipart').post(canPublish, files.upload);
  app.route('/api/v2/file/signPart').post(canPublish, files.upload);
  app.route('/api/v2/file/complete').post(canPublish, files.upload);

  // Upload directly

  // Create (multipart) sign

  // Create partSign

  // finish upload

};
*/
