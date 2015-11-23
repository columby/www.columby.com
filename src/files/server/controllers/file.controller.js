//'use strict';

var models = require('../models');
var config = require('../config/config');
var knox = require('knox');
var gm = require('gm').subClass({imageMagick: true});
var path = require('path');
var mv = require('mv');
var fs = require('fs-extra');
var moment = require('moment');

var s3client = knox.createClient({
  key: config.aws.key,
  secret: config.aws.secret,
  bucket: config.aws.bucket
});


var s3FilesRoot = '/' + config.env + '/files/';


/***
 *
 * Serve a static asset
 *
 ***/
exports.serveAsset = function(req,res) {

  // Create the s3 path
  var filename = req.params.filename;
  var filepath = s3FilesRoot + 'assets/' + filename;

  // Try to get the file from s3 and handle result
  s3client.getFile(filepath, function(err,s3res){
    // Handle error
    if (err) { return handleError(res,err); }
    // Handle Forbidden or Not found
    if ( (s3res.statusCode === 403) || (s3res.statusCode === 404) ) { return res.sendStatus(s3res.statusCode); }
    // Stream file
    if (s3res.statusCode === 200) {
      s3res.pipe(res);
      s3res.on('error', function (err) { return handleError(res, err); });
    }
  });
};


/***
 *
 * Serve a file
 *
 ***/
exports.serveFile = function(req,res) {

  // Create the s3 path
  var filename = req.params.filename;
  var fileid = req.params.id;
  var filepath = s3FilesRoot + fileid + '/' + filename;

  // Try to get the file from s3 and handle result
  s3client.getFile(filepath, function(err, s3res){
    // Handle error
    if (err) { return handleError(res,err); }
    // Handle Forbidden or Not found
    else if ( (s3res.statusCode === 403) || (s3res.statusCode === 404) ) {
      return res.sendStatus(s3res.statusCode);
    }
    // Stream file
    else if (s3res.statusCode === 200) {
      s3res.pipe(res);
      s3res.on('error', function (err) { return handleError(res, err); });
    }
    else {
      res.sendStatus(404);
    }
  });
};


/***
 *
 * Serve a derived file
 *
 ***/
exports.serveStyle = function (req, res) {

  // Validate style
  var style = req.params.style;
  var availableStyles = ['thumbnail', 'small', 'medium', 'large', 'xlarge'];
  if (availableStyles.indexOf(req.params.style) === -1) {
    return res.sendStatus(404).json({status: 'error', msg: 'Style not found'});
  }

  // Create the s3 path
  var fileId = req.params.id;
  var fileName = req.params.filename;
  var s3FilePath = s3FilesRoot + fileId + '/' + fileName;
  var s3FileStylePath = s3FilesRoot + 'styles/' + style + '/' + fileId + '/' + fileName;

  // Define local paths
  var localFilePath = path.join(__dirname, '../../tmp/' + moment());
  var localFile = localFilePath + '/' + fileName;
  var localStylePath = localFilePath + '/' + style;
  var localStyleFile = localStylePath + '/' + fileName;

  // Function to serve a file from S3
  function serveFile(done) {
    console.log('Start serving S3 file: ' + s3FileStylePath);
    s3client.getFile(s3FileStylePath, function(err, result) {
      // Handle error
      if (err) { return handleError(res,err); }
      // Stream file
      else if (result.statusCode === 200) {
        console.log('File found on S3, serving file.');
        result.pipe(res);
        result.on('error', function (err) { return handleError(res, err); });
      }
      // Handle Forbidden or Not found
      else if ((result.statusCode === 403) || (result.statusCode === 404)) {
        console.log('Derived file not found, go to next step.');
        done();
      }
      // Something else is wrong
      else {
        return handleError(res, result.statusCode);
      }
    });
  }

  // Function to get the image from S3 and store it locally
  function pullFromS3(done) {
    console.log('Pulling this image from Amazon S3: ' + s3FilePath);
    console.log('Local path: ' + localFilePath);

    // Create local directory and file
    var localDir = fs.mkdirSync(localFilePath);
    console.log('Fetching file from S3: ' + s3FilePath);
    var file = fs.createWriteStream(localFilePath + '/' + fileName);

    // Get file from s3 and save to local file
    s3client.getFile(s3FilePath, function(err, resultS3) {
      if (err) { return handleError(res,err); }
      else if ((resultS3.statusCode === 403) || (resultS3.statusCode === 404)) {
        return res.sendStatus(resultS3.statusCode);
      }

      else if (resultS3.statusCode === 200) {
        console.log('Original file found, downloading');
        resultS3.pipe(file);
        resultS3.on('error', function (err) {
          return handleError(res, 'Error downloading original file from S3. ');
        });
        resultS3.on('end', function() {
          console.log('S3 original file downloaded to local file system.');
          done();
        });
      }
      else {
        console.log('err');
        return res.sendStatus(resultS3.statusCode);
      }
    });
  }

  // Function to resize the image to the desired size
  function resizeImage(done) {
    console.log('Starting resize ' + localFilePath + '/' + fileName + ' to ' + style + ' at ' + localStyleFile);
    // Define image size
    var width;
    switch (style) {
      case 'thumbnail': width = 80; break;
      case 'small': width = 400; break;
      case 'medium': width = 800; break;
      case 'large': width = 1200; break;
      case 'xlarge': width = 1600; break;
      default: width = 800;
    }

    fs.mkdirSync(localStylePath);

    // Create local derivative
    gm(localFile).resize(width).write(localStyleFile, function(err) {
      if (err) { return handleError(err); }
      // Check if file exists.
      fs.stat(localStyleFile, function(err, stats) {
        if (err) { return handleError(res, err); }
        done();
      });
    });
  }

  // Function to send a file to S3
  function sendToS3(done) {
    console.log('Sending the file to S3: ' + s3FileStylePath);
    s3client.putFile(localStyleFile, s3FileStylePath, function (err, result) {
      if (err) { return handleError(res, err); }
      console.log('Upload complete, status: ' + result.statusCode);
      done();
    });
  }

  // Function to delete a local file
  function deleteLocalFolder(path, done) {
    console.log('Deleting local folder: ' + path);
    fs.removeSync(path);
    done();
  }

  /***
   *
   * Main loop
   *
   ***/
  // Try to get the derived image
  serveFile(function() {
    // File style not found, try to fetch the original file
    pullFromS3(function() {
      console.log('File downloaded, starting resize from ' + localFilePath + ' to: ' + style);
      // Resize the local image to local derived image
      resizeImage(function() {
        console.log('Resize done! Sending to S3.');
        // Upload the file to the derived path
        sendToS3(function() {
          console.log('Done sending to S3. Deleting local temp folder');
          // // Delete the local files
          deleteLocalFolder(localFilePath, function() {
            console.log('Done deleting.');
          });
          // Serve the new file
          serveFile(function() {
            console.log('donw sending!');
          });
        });
      });
    });
  });
};


function handleError (res, err) {
  console.log('File controller error: ', err);
  return res.json({
    status: 'error',
    msg: err
  });
}
