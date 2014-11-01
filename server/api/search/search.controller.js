'use strict';

var elasticsearch = require('elasticsearch'),
    config = require('../../config/environment/index.js'),
    mongoose = require('mongoose');

var serverOptions = {
  host: config.elasticsearch.host,
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


exports.sync = function(req,res){
  console.log('sync');
  var Dataset = mongoose.model('Dataset');
  var stream = Dataset.synchronize();
  var count = 0;

  stream.on('data', function(err, doc){
    if (err) {
      console.log('Search sync error: ', err);
    }
    count++;
  });

  stream.on('close', function(){
    res.json('indexed ' + count + ' documents!');
  });

  stream.on('error', function(err){
    res.json(err);
  });
}

function handleError(res, err) {
  return res.send(500, err);
}
