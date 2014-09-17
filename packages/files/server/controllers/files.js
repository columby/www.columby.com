'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    File = mongoose.model('File'),
    AWS = require('aws-sdk')
;


/**
 * Find file by id
 */
exports.retrieve = function(req, res, next) {

  res.json(req.file);

};

exports.create = function(req, res, next) {
  console.log(process.env.S3_KEY);
  console.log(req.body);
  res.json({result:req.body});
};


exports.signMultipartUpload = function(req,res,next){

  var s3 = new AWS.S3();
  var params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: 'somekey.ext'
  };

  s3.createMultipartUpload(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response

    res.json({data: data, err:err});
  });
};



// for param
exports.file = function(req,res,next,id) {

  File.findOne({id:id}, function(err,file){
    if (err) {
      next(err);
    } else if (file) {
      req.file = file;
      next();
    } else {
      req.file = null;
      next();
    }
  });
};
