'use strict';

/**
 * Module dependencies.
 */
var mean = require('meanio'),
    config = mean.loadConfig(),
    elasticsearch = require('elasticsearch'),
    url = require('url')
;


// Initiate the connection to the search server
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
    console.log('All is well');
  }
});

// General search function.
exports.search = function(req,res){

  if (!req.query.query) {
    return res.json({err:'error, no query provided'});
  }

  var qryObj = JSON.parse(req.query.query);

  elasticSearchClient.search({
    index: 'datasets',
    body: qryObj.body
  }).then(function(result){
    console.log('res', result);
    res.send(result);
  }, function(err){
    console.log('err',err);
  });

};
