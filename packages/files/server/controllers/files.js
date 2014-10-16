'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    crypto    = require('crypto'),
    config    = require('meanio').loadConfig(),
    AWS = require('aws-sdk');

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

function createS3Policy(contentType, callback) {
  var s3Policy = {
    'expiration': getExpiryTime(),
    'conditions': [
      ['starts-with', '$key', 's3UploadExample/'],
      {'bucket': config.aws.bucket},
      {'acl': 'public-read'},
      ['starts-with', '$Content-Type', contentType],
      {'success_action_status' : '201'}
    ]
  };
  console.log('s3policy', s3Policy);

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

  callback(s3Credentials);
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


// Sign a request
exports.sign = function(req,res,next) {

  createS3Policy(req.query.mimeType, function(creds, err) {
    if (!err){
      return res.json(creds);
    } else {
      return res.status(500).json(err);
    }
  });
};

exports.handleS3success = function(req,res,next) {
  res.send('success');
};
