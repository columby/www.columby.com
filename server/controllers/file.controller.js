'use strict';

var _ = require('lodash'),
    File = require('../models/index').File,
    crypto    = require('crypto'),
    config = require('../config/environment/index'),
    AWS = require('aws-sdk'),
    path = require('path')
;

/** ------ FUNCTIONS ------------------------------------------------------- **/

function getExpiryTime() {
  var _date = new Date();
  return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
    (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
}

function createS3Policy(file, callback) {
  //console.log('file',file);
  var s3Policy = {
    'expiration': getExpiryTime(),
    'conditions': [
      //['starts-with', '$key', file.owner+'/'],
      //['starts-with', '$key', file.account_id + '/' + file.filename],
      ['eq', '$key', file.account_id + '/' + file.filename ],
      {'bucket': config.aws.bucket},
      {'acl': 'public-read'},
      ['starts-with', '$Content-Type', file.filetype],
      {'success_action_status' : '201'},
      ['content-length-range', 0, file.size]
    ]
  };
  console.log('policy', s3Policy);
  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

  // sign the base64 encoded policy
  var signature = crypto.createHmac('sha1', config.aws.secretKey)
                      .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

  // build the results object
  return {
      policy: base64Policy,
      signature: signature,
      key: config.aws.publicKey,
      bucket: config.aws.bucket
  };
}

/* ------ ROUTES ---------------------------------------------------------- */

// Get list of files
exports.index = function(req, res) {
  File
    .find()
    .sort('-createdAt')
    .populate('owner', 'username')
    .exec(function(err,files){
      if(err) { return handleError(res, err); }
      if(!files) { return res.send(404); }
      return res.json(files);
    });
};

// Get a single file
exports.show = function(req, res) {
  File.findById(req.params.id, function (err, file) {
    if(err) { return handleError(res, err); }
    if(!file) { return res.send(404); }
    return res.json(file);
  });
};

// Creates a new file in the DB.
exports.create = function(req, res) {
  if (!req.user) {
    res.json({err:'No user id'});
  }

  var file = req.body;
  file.owner = req.user._id;

  File.create(file, function(err, file) {
    if(err) { return handleError(res, err); }
    return res.json(201, file);
  });
};

// Updates an existing file in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  File.findById(req.params.id, function (err, file) {
    if (err) { return handleError(res, err); }
    if(!file) { return res.send(404); }
    var updated = _.merge(file, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, file);
    });
  });
};

// Deletes a file from the DB.
exports.destroy = function(req, res) {
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
exports.sign = function(req,res) {

  // Signing a request involves 3 steps:
  //   1. Create a unique, slugified filename
  //   2. Create a File record in the database
  //   3. Create a policy for upload

  // Handle the supplied query parameters
  var file = {
    type      : req.query.type,
    filetype  : req.query.filetype,
    size      : req.query.filesize,
    filename  : req.query.filename,
    account_id: req.query.accountId
  };

  // Check file type validity
  var validTypes = [];
  var maxSize =0;
  switch (req.query.type){
    case 'image':
      validTypes = [ 'image/png', 'image/jpg', 'image/jpeg' ];
      maxSize = 10000000; //10 mb
      break;
  }

  if (validTypes.indexOf(file.filetype) === -1) {
    return res.status(400).json({status: 'error', err: 'File type ' + file.type + ' is not allowed. '});
  } else if (file.filesize > maxSize){
    console.log('the file is valid');
    return res.json({status: 'error', err: 'File size ' + file.size + ' is too big. ' + maxSize + ' allowed. '});
  } else {
    // Create a File record in the database
    File.create(file).success(function(file){
      var file = file.dataValues;
      var credentials = createS3Policy(file);
      // Send back the policy
      return res.json({
        file: file,
        credentials: credentials
      });
    }).error(function(error){
      handleError(res,error);
    });
  }
};

/**
 *
 * Handle a successful upload
 * Update the status of a file from draft to published
 *
 */
exports.handleS3Success = function(req,res) {
  File.find(req.body.fileId).success(function (file) {
    file.updateAttributes({
      status: true,
      url: req.body.url
    }).success(function(file){
      //console.log(file.dataValues);
      return res.json(file);
    }).error(function(err){
      handleError(res,err);
    });
  }).error(function (err) {
    handleError(res, err);
  });
};




function handleError(res, err) {
  console.log('Error: ', err);
  return res.send(500, err);
}
