'use strict';

/**
 *
 * Dependencies
 *
 */
var models = require('../models/index');
var pg = require('pg');
var copyTo = require('pg-copy-streams').to;
var config = require('../config/config');
var fs = require('fs');
var mv = require('mv');
var path = require('path');
var knox = require('knox');


/*-------------- PRIMARY DISTRIBUTION --------------------------------------------------------*/
/**
 *
 **/
 exports.index = function(req,res){ };


/**
 *
 **/
exports.show = function(req,res){ };


/**
 *
 * Create a new Primary source
 *
 */
exports.create = function(req,res){
  console.log('Creating primary source');
  console.log(req.body);
  var primary = req.body;

  models.Primary.create(primary).then(function(primary) {
    console.log('p', primary.dataValues);
    return res.json(primary.dataValues);
  }).catch(function(err){
    return handleError(res,err);
  });
};


/**
 *
 **/
exports.update = function(req,res){

  models.Primary.findById(req.params.id).then(function(primary){
    primary.updateAttributes(req.body).then(function(primary){
      return res.json(primary);
    }).catch(function(err){
      return handleError(res,err);
    });
  }).catch(function(err){
    return handleError(res,err);
  });
};


/**
 *
 **/
exports.destroy = function(req,res){

  models.Primary.find({
    where: { id: req.params.id },
    include: [
      { model: models.Distribution, as: 'distribution', include: [
        { model: models.Dataset, as: 'dataset' }
      ] }
    ]}).then(function(primary){

      // Delete the table
      var conn = config.db.postgis;
      pg.connect(conn, function(err,client,done){
        if (err){
          console.log('error connectiing: ', err);
        }
        var sql='DROP TABLE IF EXISTS primary_' +  primary.id + ';';
        console.log('sql', sql);
        client.query(sql, function(err,result){
          if (err){
            console.log(err);
          }
          done();
        });
      });
      primary.destroy().then(function(){
        return res.json({status:'success'});
      }).catch(function(err){
        return handleError(res,err);
      });

    }).catch(function(err){
      return handleError(res,err);
    });
};


/**
 *
 * (re)sync an existing primary source.
 *
 */
exports.sync = function(req,res) {

  models.Primary.find({
    where: {id: req.params.id},
    include: [{
      model: models.Distribution, as: 'distribution', include: [
        { model: models.Dataset, as: 'dataset' }
      ]}
    ]}).then(function (primary) {
      // Create a new job
      var j = {
        type: req.body.jobType,
        dataset_id: req.body.datasetId
      };

      models.Job.create(j).then(function(job){
        console.log('Job ' + job.id + ' created. Updating Primary source. ');
        // update primary source status
        models.Primary.update({
          jobStatus: 'active'
        },{
          where: { id: req.body.primaryId }
        }).then(function(updatedPrimary){
          console.log('updated primary ', updatedPrimary);
          res.json({result: updatedPrimary});
        }).catch(function(err){
          return handleError(res,err);
        });
      }).catch(function(err){
        return handleError(res,err);
      });
    });
};


/**
 * Convert a database table to a csv file for a primary source, based on a primary_id
 *
 **/
exports.convert = function (req, res) {
  console.log('Primary controller, convert.');
  console.log(req.body.primary_id);

  var primaryId = req.body.primary_id;

  models.Primary.findById(primaryId, {
    include: [
      {model: models.Dataset, as: 'dataset'}
    ]
  }).then(function(primary) {
    console.log(primary.dataValues.dataset.dataValues.account_id);
    if (!primary) { return res.json({status: 'error', msg: 'No primary found'}); }
    // Connect to the postgis database
    pg.connect(config.db.postgis.uri, function (err, client, done) {
      console.log('err ', err);
      console.log('host ', client.host);

      var uploadFile = path.join(config.root, '../../tmp/primary_' + primaryId + '.csv');
      console.log('uploadfile', uploadFile);

      var stream = client.query(copyTo('COPY "primary_' + primaryId + '" TO STDOUT WITH DELIMITER \',\' CSV HEADER'));
      var fileStream = fs.createWriteStream(uploadFile);
      stream.pipe(fileStream);
      fileStream.on('finish', function () {
        console.log('Table convert finished.');
        done();
        fs.stat(uploadFile, function(error, stat) {
          if (error) { return handleError(res,error); }
          console.log(stat.size);
          var f = {
            filename: 'primary_' + primaryId + '.csv',
            account_id: primary.dataValues.dataset.dataValues.account_id,
            type: 'datafile',
            size: stat.size,
            status: true,
            filetype: 'text/csv',
            title: '',
            description: ''
          }
          models.File.create(f).then(function(file) {
            console.log(file.dataValues);
            var s3client = knox.createClient({
              key: config.aws.key,
              secret: config.aws.secret,
              bucket: config.aws.bucket
            });
            file.updateAttributes({
              url: file.dataValues.id + '/' + file.dataValues.filename
            }).then(function (some) {
              console.log('ok', file.dataValues.url);
              var s3file = '/' + config.environment + '/files/' + file.url;
              console.log('s3file url: ' + s3file);
              s3client.putFile(uploadFile, s3file, function(err, result){
                console.log(err);
                console.log(result.statusCode);
                // update file status at primary
                primary.setFile(file).then(function(some) {
                  console.log('sss', some.dataValues.id);
                  return res.json({status: '200', primary: some, file: file});
                }).catch(function (err) {
                  console.log('e', err);
                  return handleError(res,err);
                });
              });
            }).catch(function (err) {
              return handleError(res,err);
            });
          }).catch(function (err) {
            return handleError(res,err);
          });
        });
      }).on('error', function (err) {
        done();
        return handleError(res,err);
      });
    });
  }).catch(function (err) {
    return handleError(res,err);
  });
};


function handleError(res, err) {
  console.log('Primary error,', err);
  return res.status(500).json({status:'error',msg:err });
}
