'use strict';

var models = require('../models');
var config = require('../config/config');
var knox = require('knox');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var mv = require('mv');
var fs = require('fs');
var pg = require('pg');
var copyTo = require('pg-copy-streams').to;

var s3client = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.aws.bucket
});

// Serve a static asset
/**
 /image/filename.png
 /image/small/image.png
 /dataset/set.csv
**/
exports.serve = function (req, res) {
  var availableStyles = ['thumbnail', 'small', 'medium', 'large', 'xlarge'];
  // validate style
  var style;
  if (availableStyles.indexOf(req.params.style) !== -1) {
    style = req.params.style;
  }
  var params = req.params;
  var type = params.type;
  var filename = params.filename;
  var filepath = req.path;
  var s3url = '/' + config.env + '/files' + filepath;

  // Try to get the file from S3
  s3client.getFile(s3url, function (err, s3res) {
    // Handle error tryin to fetch file
    if (err) { return handleError(res, err); }
    // Handle forbidden file
    if (s3res.statusCode === 403) {
      return res.sendStatus(s3res.statusCode).json(JSON.stringify(s3res));
    }
    // Handle file found
    if (s3res.statusCode === 200) {
      s3res.pipe(res);
      s3res.on('error', function (err) { return handleError(res, err); });
    }
    // Original file not found
    if ((s3res.statusCode === 404) && !style) { return res.status(404).json('Not found'); }

    // Derivative file not found (try to create derivative)
    if ((s3res.statusCode === 404) && (style)) {
      console.log('env: ' + config.env);
      console.log('type: ' + type);
      console.log('filename' + filename);
      var srcUrl = '/' + config.env + '/files/' + type + '/' + filename;
      console.log('Trying to create derivative from ' + srcUrl);
      // Try to create a derivative
      // Create a temporary local file for download
      var tmpPath = path.join(__dirname, '../tmp/' + filename);
      console.log('Local path: ' + tmpPath);
      var file = fs.createWriteStream(tmpPath);
      file.on('open', function (fd) {
        console.log('file opened');
        console.log(srcUrl);
        s3client.getFile(srcUrl, function (err, origResponse) {
          // Handle error or not found
          if (err) {
            return handleError(res, err);
          }
          if (origResponse.statusCode === 404) { return res.status(404).json('Original file not found'); }
          // Handle success
          if (origResponse.statusCode === 200) {
            console.log('Original file found, downloading');
            // save s3 file to local tmp location
            origResponse.pipe(file);
            // handle save error
            origResponse.on('error', function (er) {
              return handleError(res, 'Error downloading original file from S3. ');
            });
            // handle save finished
            origResponse.on('end', function () {
              console.log('S3 original file downloaded to local.');
              // Create local derivative
              var w = 1600;
              switch (style) {
                case 'thumbnail': w = 80; break;
                case 'small': w = 400; break;
                case 'medium': w = 800; break;
                case 'large': w = 1200; break;
                case 'xlarge': w = 1600; break;
                default: return handleError(res, 'Not a valid style: ' + style);
              }

              var resizedFilePath = path.join(__dirname, '../tmp/resized/' + filename);
              console.log('Creating derivative ' + style + ' from ' + tmpPath + ' at ' + resizedFilePath);
              gm(tmpPath).resize(w).write(resizedFilePath, function (er) {
                // Get filesize
                fs.stat(resizedFilePath, function (er, stats) {
                  if (er) {
                    handleError(res, er);
                    return;
                  }
                  // Send file to S3
                  console.log('Sending derived file to S3 from: ' + resizedFilePath);
                  console.log('to ' + s3url);
                  s3client.putFile(resizedFilePath, s3url, function (err, uploadResponse) {
                    if (err) {
                      handleError(res, err);
                      return;
                    }
                    console.log('Upload complete, status: ' + uploadResponse.statusCode);
                    // Serve the created and uploaded derivative
                    if (uploadResponse.statusCode === 200) {
                      console.log('Fetching file to stream to res: ' + s3url);
                      s3client.getFile(s3url, function (er, s3FinalResponse) {
                        console.log('done ' + s3FinalResponse.statusCode);
                        if (s3FinalResponse.statusCode === 200) {
                          console.log('stream');
                          s3FinalResponse.pipe(res);
                          s3FinalResponse.on('error', function (er) {
                            return handleError(res, 'Error downloading original file from S3. ');
                          });
                          // handle save finished
                          s3FinalResponse.on('data', function () {
                            // console.log('data');
                          });
                          s3FinalResponse.on('end', function () {
                            console.log('end');
                          });
                        }
                      });
                    }
                  });
                });
              });
            });
          }
        });
      }).on('error', function (err) {
        return handleError(res, err);
      });
    } else {
      console.log(filepath + ' not found ');
      return res.sendStatus(s3res.statusCode);
    }
  });
};

/**
 * Convert a database table to a csv file for a primary source, based on a primary_id
 *
 **/
exports.convert = function (req, res) {
  console.log(req.body.primaryId);
  console.log(req.body);
  if (!req.body.primaryId) {
    return res.json({status: 'error', msg: 'No primary id provided. '});
  }

  models.Primary.find({
    where: {
      id: req.body.primaryId
    }
    // include: [
    //   { model: models.Dataset },
    // ]
  }).then(function (primary) {
    // console.log('primary', primary);
    if (!primary) { return res.json({status: 'error', msg: 'No primary found'}); }
    pg.connect(config.db.postgis.uri, function (err, client, done) {
      console.log(err);
      console.log(client.host);
      // res.send(req.body.primaryId);
      var uploadFile = config.root + '/files/tmp' + '/primary_' + req.body.primaryId + '.csv';
      console.log(uploadFile);

      var stream = client.query(copyTo('COPY "primary_' + req.body.primaryId + '" TO STDOUT'));
      var fileStream = fs.createWriteStream(uploadFile);
      stream.pipe(fileStream);
      fileStream.on('finish', function () {
        console.log('finish');
        done();

        models.File.create({
          filename: 'primary_' + req.body.primaryId + '.csv'
        }).then(function (file) {
          // copy file to permanent location
          var fileNewPath = config.root + '/files/d/' + file.shortid + '/' + file.filename;

          file.updateAttributes({
            url: '/d/' + file.shortid + '/' + file.filename
          }).then(function (some) {
            console.log('ok', file.dataValues);
          }).catch(function (err) {
            console.log('err', err);
          });

          mv(uploadFile, fileNewPath, {mkdirp: true}, function (err) {
            if (err) {
              console.log('error moving file', err);
              return res.json({status: 'error', msg: err});
            } else {
              // update file status at primary
              primary.setFile(file).then(function (some) {
                res.json({status: 'ok', file: file.dataValues});
              }).catch(function (err) {
                return res.json({status: 'error', msg: err});
              });
            }
          });
        }).catch(function (err) {
          console.log('err', err);
          return res.json({status: 'error', msg: err});
        });
      }).on('error', function (err) {
        console.log('error endstream');
        done();
        return res.json({status: 'error', msg: err});
      });
    });
  }).catch(function (err) {
    console.log('err', err);
  });
};

function handleError (res, err) {
  console.log('File controller error: ', err);
  return res.json({
    status: 'error',
    msg: err
  });
}
