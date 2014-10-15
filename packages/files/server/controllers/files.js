'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    crypto    = require('crypto'),
    config    = require('meanio').loadConfig(),
    AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.aws.publicKey,
  secretAccessKey: config.aws.secretKey
});

var expectedBucket = config.aws.bucket,
    expectedMinSize = null,
    expectedMaxSize = null;

/* ------ FUNCTIONS ------------------------------------------------------- */
// Ensures the REST request is targeting the correct bucket.
// Omit if you don't want to support chunking.
function isValidRestRequest(headerStr) {
    return new RegExp('\/' + expectedBucket + '\/.+$').exec(headerStr) !== null;
}

function isPolicyValid(policy) {
    var bucket, parsedMaxSize, parsedMinSize, isValid;

    policy.conditions.forEach(function(condition) {
        if (condition.bucket) {
            bucket = condition.bucket;
        }
        else if (condition instanceof Array && condition[0] === 'content-length-range') {
            parsedMinSize = condition[1];
            parsedMaxSize = condition[2];
        }
    });

    isValid = bucket === expectedBucket;

    // If expectedMinSize and expectedMax size are not null (see above), then
    // ensure that the client and server have agreed upon the exact same
    // values.
    if (expectedMinSize !== null && expectedMaxSize !== null) {
        isValid = isValid && (parsedMinSize === expectedMinSize.toString()) && (parsedMaxSize === expectedMaxSize.toString());
    }

    return isValid;
}

function signPolicy(req,res){
  console.log(req.body);
  var base64Policy = new Buffer(JSON.stringify(req.body)).toString('base64'),
      signature = crypto.createHmac('sha1', config.aws.secretKey)
      .update(base64Policy)
      .digest('base64');
  var jsonResponse = {
    policy: base64Policy,
    signature: signature
  };
  if (isPolicyValid(req.body)){
    res.json(jsonResponse);
  } else {
    res.json({invalid: true});
  }
}

function signRestRequest(req,res) {
  console.log('signRestRequest');
  var stringToSign = req.body.headers,
      signature = crypto.createHmac('sha1', config.aws.publicKey)
      .update(stringToSign)
      .digest('base64');
  var jsonResponse = {
    signature: signature
  };

  res.setHeader('Content-Type', 'application/json');

  if (isValidRestRequest(stringToSign)) {
    res.end(JSON.stringify(jsonResponse));
  } else {
    res.status(400);
    res.end(JSON.stringify({invalid:true}));
  }
}

// Sign any request
function signRequest(req,res){
  if (req.body.headers) {
    // multipart upload
    signRestRequest(req,res);
  } else {
    // single upload
    signPolicy(req,res);
  }
}

function handleFileSuccess(req,res){
  console.log('s3 succes!', req.body);

  File.findOne({s3_key: req.body.key}, function(err, file){
    if (err){ res.json({err: err});}
    if (file) {
      file.status = 'Public';
      file.save();
      res.json(file);
    }
  });
}


/* ------ ROUTES ---------------------------------------------------------- */
// Get a file by id
exports.file = function(req,res,next,id){
  File.findOne({_id:id}, function(err,file) {
    if (err) return next(err);
    if (!file) return next(new Error('Failed to load deelnemer item ' + id));
    req.file = file;
    next();
  });
};

// Get a listing of files
exports.all = function(req,res){
  File
    .find()
    .sort('-createdAt')
    .populate('owner', 'username')
    .exec(function(err,files){
      res.json(files);
    });
};

// Create a new file
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
exports.handleS3 = function(req,res,next) {

  console.log('handling S3 sign');

  // check if user can publish


  //convert conditions to object
  var a = req.body.conditions;
  var b = {};
  for (var i = 0; i < a.length; i=i+1) {
    var k = Object.keys(a[i])[0];
    var v = a[i][k];
    b[k] = v;
  }

  // Create a file slot
  var file = new File({
    s3_key    : b.key,
    filename  : b['x-amz-meta-qqfilename'],
    title     : b['x-amz-meta-qqfilename'],
    status    : 'uploading',
    type      : b['Content-Type'],
    size      : b.size,
    owner     : req.user._id,
  });
  file.save();
  console.log('file', file);

  // check request type
  if (req.query.success !== undefined) {
    handleFileSuccess(req, res);
  } else {
    signRequest(req,res);
  }
};

exports.handleS3success = function(req,res,next) {
  handleFileSuccess(req,res);
};
