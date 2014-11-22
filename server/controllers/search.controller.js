'use strict';

var elasticsearch = require('elasticsearch'),
    config = require('../config/environment/index.js'),
    mongoose = require('mongoose'),
    Dataset = require('../routes/dataset/dataset.model.js')
;

var serverOptions = {
  host: config.elasticsearch.host,
  log: config.elasticsearch.logging
};

//console.log('connecting to elasticsearch host: ', config.elasticsearch.host);
//var elasticSearchClient = new elasticsearch.Client(serverOptions);
//console.log('checking server status');
//// Check the connection on startup
//elasticSearchClient.ping({
//  // ping usually has a 100ms timeout
//  requestTimeout: 1000,
//  // undocumented params are appended to the query string
//  hello: 'elasticsearch!'
//}, function (error) {
//  if (error) {
//    console.log('NOOOO, elasticsearch cluster is down!');
//  } else {
//    console.log('YEEES, elasticsearch is well');
//  }
//});


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
    //console.log('res', result);
    res.send(result);
  }, function(err){
    console.log('err',err);
    handleError(res,err);
  });
};


exports.sync = function(req,res){

  // Delete the index
  elasticSearchClient.indices.delete({
    timeout: 1000,
    index: 'datasets'
  }, function(error, response, status){
    console.log('delete index status');
    console.log('error', error);
    console.log('response', response);
    console.log('status', status);

    // Initiate the new index
    elasticSearchClient.indices.create({
      timeout: 1000,
      index: 'datasets',
      type: 'dataset'
    }, function(error, response,status){
      console.log('create index status');
      console.log('error', error);
      console.log('response', response);
      console.log('status', status);


      // Dataset
      //   .find({})
      //   .select('title description tags')
      //   .limit(10)
      //   .exec(function(err,datasets){
      //     //console.log(datasets);
      //     indexSet = datasets;
      //     send();
      //     // // Sync
      //     // elasticSearchClient.bulk({
      //     //   body: s
      //     // }, function (err, resp) {
      //     //   if (err){console.log(err);}
      //     //   console.log(resp);
      //     //   console.log(resp);
      //     // });
      //   }
      // );


      var stream = Dataset.synchronize(),
      count = 0;

      stream.on('data', function(err, doc){
        //console.log(err, doc);
        if (err) { console.log('err', err); }
        count++;
      });
      stream.on('close', function(){
        console.log('indexed ' + count + ' documents!');
        return res.json('indexed ' + count + ' documents!');
      });
      stream.on('error', function(err){
        console.log(err);
      });
    })

  });
}

function handleError(res, err) {
  return res.send(500, err);
}
