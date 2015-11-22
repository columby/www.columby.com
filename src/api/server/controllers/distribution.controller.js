'use strict';

var config = require('../config/config'),
    models = require('../models/index'),
    request = require('request'),
    fileController = require('./file.controller');

/**
 *
 * Get a list of distributions
 *
 */
exports.index = function(req,res) { };


/**
 *
 * Show a distribution
 *
 */
exports.show = function(req,res){
  console.log(req.params);
};


/**
 *
 * Create a new distribution
 *
 */
exports.create = function(req,res) {
  var distribution = req.body;
  // Create the distribution
  models.Distribution.create(distribution).then(function(result){
    return res.json(result);
  }).catch(function(err){
    return handleError(res,err);
  });
};


/**
 *
 * Update a distribution
 *
 */
exports.update = function(req,res) {
  if (!req.distribution) return res.json({ status:'error', err: 'Failed to load distribution' });

  models.Distribution.findById(req.body.id).then(function(distribution){
    distribution.updateAttributes(req.body).then(function(distribution){
      return res.json(distribution);
    });
  }).catch(function(err){
    return handleError(res,err);
  });
};


/**
 *
 * Delete a distribution
 *
 */
exports.destroy = function(req,res) {

  console.log('Destoying datasource: ' + req.distribution.id);

  /**
   * Distribution is already attached to req by the auth middleware
   * Delete the local File
   * Delete the file entry
   * Delete the distribution entry
   **/

  if (!req.distribution) return res.json({ status:'error', err: 'Failed to load distribution' });

  if (req.distribution.file_id){
    // Todo: delete the file from disk

    // Delete the file entry
    models.File.destroy({ where: { id: req.distribution.file_id } }).then(function(result){
      console.log('File entry ' + req.distribution.file_id + ' deleted.');
      // delete the distribution entry
      models.Distribution.destroy({where: { id: req.distribution.id } }).then(function(result){
        console.log('Distribution entry ' + req.distribution.id + 'deleted. ');
        res.json({status:'success', msg: result});
      }).catch(function(err){
        handleError(res,err);
      });
    }).catch(function(err) {
      handleError(res,err);
    });
  } else {
    // delete the distribution entry
    models.Distribution.destroy({where: { id: req.distribution.id } }).then(function(result){
      res.json({status:'success', msg: result});
    }).catch(function(err){
      handleError(res,err);
    });
  }
};


/**
 *
 * Validate if a supplied link is valid for processing by columby
 *
 */
exports.validateLink = function(req,res){

  // Validate if it is a readable URL
  var url = req.body.url;
  console.log('url',url);

  // get link properties
  if (!url) {
    return res.json({status:'error', message: 'No url provided'});
  }

  // Temp check for a specific api case
  if (url==="http://ictdashboarddenhaag.fortes.nl/opendata/") {
    return res.json({valid:true, type:'fortes'});
  }

  request({
    uri: url,
    method: 'GET',
    timeout: 1500,
    followRedirect: true,
    maxRedirects: 10
  },function(err, response, body){
    if (err || response.statusCode !== 200) {
      console.log('url not found.');
      return res.json({ valid: false, msg: 'Non readable url', err: err });
    }

    // Validate for arcgis
    validateArcgis(url, function(result){
      if (result){
        return res.json({valid: true, type: 'arcgis'})
      } else {
        return res.json({ valid: false, msg: 'No valid url' });
      }
    });
  });
};



/**
 *
 * Validate if a source is a readable arcgis service.
 *
 */
function validateArcgis(url,cb){
  request({
    uri:url,
    method: 'GET',
    timeout: 2500,
    followRedirect: true,
    maxRedirects: 10,
    qs: {
      pretty:true,
      f:'json'
    }
  }, function(err,response,body){
    if (response && response.statusCode===200){
      var o = body;
      try {
        o = JSON.parse(body);
      } catch(err){
        console.log('err parsing',err);
        return cb(false);
      }

      if (o && typeof(o) === 'object' && o !== null) {
        if (o.currentVersion && o.capabilities) {
          return cb(true);
        }
      }
    }
    return cb(false);
  });
}


/**
 *
 * Validate if a source is a readable Fortes service.
 *
 */
function validateFortes(url,cb){
  console.log('check fortes: ', url);
  if (url==="http://ictdashboarddenhaag.fortes.nl/opendata/") {
    cb(true);
  } else {
    cb(false);
  }
}



function handleError(res, err) {
  console.log('Dataset error,', err);
  return res.json({status: 'error', msg:err});
}
