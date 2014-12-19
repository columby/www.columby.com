'use strict';

/**
 * Dependencies
 *
 */
var _ = require('lodash'),
  models = require('../models/index'),
  Sequelize = require('sequelize')
  ;


exports.index = function(req,res) {
  console.log(req.params);
  var id = req.params.id;
  console.log(id);
};

exports.show = function(req,res){
  console.log(req.params);
};


/**
 *
 * Create a new distribution
 *
 * required: dataset_id;
 *
 * @param req
 * @param res
 */
exports.create = function(req,res) {
  console.log(req.body);
  models.Distribution.create(req.body).success(function(distribution){
    console.log(distribution);
    res.json(distribution);
  }).error(function(err){
    return handleError(res,err);
  });
};


/**
 *
 * Update a distribution
 *
 * @param req
 * @param res
 */
exports.update = function(req,res) {
  console.log(req.body);
  models.Distribution.find(req.body.id).success(function(distribution){
    distribution.updateAttributes(req.body).success(function(distribution){
      res.json(distribution);
    })
  }).error(function(err){
    return handleError(res,err);
  })
};


/**
 *
 * Delete a distribution
 *
 * @param req
 * @param res
 */
exports.destroy = function(req,res) {
  console.log(req.params);
  models.Distribution.find(req.params.id).success(function(distribution){
    if (!distribution) return res.json({ status:'error', err: 'Failed to load distribution' });
    distribution.destroy().success(function(){
      res.json({status:'success'});
    }).error(function(err){
      handleError(res,err);
    });
  });
};


function handleError(res, err) {
  console.log('Dataset error,', err);
  return res.send(500, err);
}
