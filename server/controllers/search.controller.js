'use strict';

var config = require('../config/environment/index.js'),
    Dataset = require('../models/index').Dataset,
    Sequelize = require('sequelize')
;


// Get list of searchs
exports.search = function(req, res) {
  if (!req.query.query) {
    handleError(res, 'error, no query provided');
  }

  var query = JSON.parse(req.query.query);
  var q = query.body.query.wildcard._all;

  var wheres = [];
  var _q = q.trim().split(" ");
  for(var idx=0; idx < _q.length; idx++) {
      wheres.push({title: { ilike: "%"+_q[idx]+"%" }});
  }

  Dataset.findAll({
    where: Sequelize.or(wheres)
  })
    .on('sql', console.log)         // BUG! Somehow sequelize does an OR
    .success(function(datasets){
        return res.json(datasets);
    })
    .error(function(err){
        console.log('Error: ', err);
        handleError(res, err);
    })

  //return res.json({status:"ok", query:query});
};


function handleError(res, err) {
  return res.send(500, err);
}
