'use strict';

var config = require('../config/environment/index.js'),
    Dataset = require('../models/index').Dataset
;


// Get list of searchs
exports.search = function(req, res) {
  if (!req.query.query) {
    handleError(res, 'error, no query provided');
  }
};


function handleError(res, err) {
  return res.send(500, err);
}
