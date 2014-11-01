'use strict';

var elasticsearch = require('elasticsearch'),
    url = require('url'),
    config = require('../../config/environment/index.js');

var connectionString = url.parse(config.elasticsearch.host);
var serverOptions = {
  host: connectionString.host,
  log: config.elasticsearch.logging
};
var elasticSearchClient = new elasticsearch.Client(serverOptions);

// Check the connection on startup
elasticSearchClient.ping({
  // ping usually has a 100ms timeout
  requestTimeout: 1000,
  // undocumented params are appended to the query string
  hello: 'elasticsearch!'
}, function (error) {
  if (error) {
    console.log('NOOOO, elasticsearch cluster is down!');
  } else {
    console.log('YEEES, elasticsearch is well');
  }
});

// Get list of searchs
exports.search = function(req, res) {
  if (!req.query.query) {
    handleError(res, 'error, no query provided');
  }

  var qryObj = JSON.parse(req.query.query);
  console.log('Trying to find ', qryObj);
  elasticSearchClient.search({
    index: 'datasets',
    body: qryObj.body
  }).then(function(result){
    console.log('res', result);
    res.send(result);
  }, function(err){
    console.log('err',err);
    handleError(res,err);
  });
};



function handleError(res, err) {
  return res.send(500, err);
}
