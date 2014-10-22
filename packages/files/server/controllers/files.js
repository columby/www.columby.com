'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    crypto    = require('crypto'),
    config    = require('meanio').loadConfig(),
    AWS = require('aws-sdk'),
    path = require('path');

// Set the right credentials for aws.
// currently only needed for delete
AWS.config.update({
  accessKeyId: config.aws.publicKey,
  secretAccessKey: config.aws.secretKey
});


/* ------ FUNCTIONS ------------------------------------------------------- */

function getExpiryTime() {
  var _date = new Date();
  return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
    (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
}

function createS3Policy(file) {

  var s3Policy = {
    'expiration': getExpiryTime(),
    'conditions': [
      ['starts-with', '$key', file.owner+'/'],
      {'bucket': config.aws.bucket},
      {'acl': 'public-read'},
      ['starts-with', '$Content-Type', file.type],
      {'success_action_status' : '201'},
      ['content-length-range', 0, file.size]
    ]
  };
  // console.log('s3policy', s3Policy);

  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

  // sign the base64 encoded policy
  var signature = crypto.createHmac('sha1', config.aws.secretKey)
    .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

  // build the results object
  var s3Credentials = {
      s3Policy: base64Policy,
      s3Signature: signature,
      AWSAccessKeyId: config.aws.publicKey
  };

  return s3Credentials;
}

/* ------ ROUTES ---------------------------------------------------------- */

/**
 * Get a file by id
 **/
exports.file = function(req,res,next,id){
  File.findOne({_id:id}, function(err,file) {
    if (err) return next(err);
    if (!file) return next(new Error('Failed to load deelnemer item ' + id));
    req.file = file;
    next();
  });
};

/**
 * Get a listing of files
 **/
exports.all = function(req,res){
  File
    .find()
    .sort('-createdAt')
    .populate('owner', 'username')
    .exec(function(err,files){
      res.json(files);
    });
};

/**
 * Create a new file
 **/
exports.create = function(req,res){
  if (!req.user) {
    res.json({err:'No user id'});
  }

  var file = req.body;
  file.owner = req.user._id;

  File.create(file, function(err,file){
    if (err) return res.json({err:err});
    if (!err) return res.json(file);
  });
};

// get a file
exports.show = function(req,res){
  res.json(req.file || {});
};

// Update an existing file
exports.update = function(req,res,id){

  res.json({success: true});
};

// Delete a file
exports.destroy = function(req,res){

  var s3 = new AWS.S3();
  // Find the file
  File.findOne({_id: req.file._id}, function (err,file){
    // File found, delete it from s3
    var params = {
      Bucket: config.aws.bucket,
      Key: file.s3_key
    };
    s3.deleteObject(params, function(err, data) {
      if (err) {
        return res.json({
          status:'error',
          err: err});
      } else {
        file.remove(function(result){
          console.log('remove');
          res.json({status: 'success'});
        });
      }
    });
  });
};


/***
 * Sign a request
 *
 * Required params: size, type, name
 *
 ***/
exports.sign = function(req,res,next) {

  // Signing a request involves 3 steps:
  //   1. Create a unique, slugified filename
  //   2. Create a File record in the database
  //   3. Create a policy for upload

  // Handle the supplied query parameters
  var file = {
    type      : req.query.type,
    size      : req.query.size,
    filename  : req.query.name,
    owner     : req.query.accountId
  };

  // Slugify name
  var ext = path.extname(file.filename);
  var basename = path.basename(file.filename, ext).toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  file.filename = basename+ext;

  // Check file type validity
  var validTypes = ['.jpg', '.png', '.jpeg'];
  if (validTypes.indexOf(ext) === -1) {
    res.status(400).json({err: 'File type ' + ext + ' is not allowed. '});
  }

  // Check if a user can upload the filesize

  // Create a File record in the database
  File.create(file, function(err,doc){
    if (err) return res.json({err:err});
    if (!err) {
      // update the filename, making it unique by using the _id
      doc.filename = doc._id + '_' + file.filename;
      doc.save();
      // Create policy
      var credentials = createS3Policy(file);
      // Send back the policy
      return res.json({
        file: doc,
        credentials: credentials
      });
    }
  });
};

/***
 * Handle a succesful uplad
 * Update the status of a file from draft to published
 *
 ***/
exports.handleS3success = function(req,res,next) {
  File.findOne({_id: req.body.fileId}, function(err,file){
    if (err) return err;
    if (file) {
      file.status = 'published';
      file.url = req.body.url;
      file.save();
      res.json(file);
    }
  });

};
