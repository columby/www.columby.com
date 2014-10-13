'use strict';

var mean = require('meanio'),
    config = mean.loadConfig(),
    elasticsearch = require('elasticsearch'),
    url = require('url');

// The Package is past automatically as first parameter
module.exports = function(Columby, app, auth, database) {

  var connectionString = url.parse(config.elasticsearch.host);
  var serverOptions = {
    host: connectionString.host,
    log: 'trace'
  };

  var elasticSearchClient = new elasticsearch.Client(serverOptions);
  //console.log('esss', elasticSearchClient);

  elasticSearchClient.ping({
    // ping usually has a 100ms timeout
    requestTimeout: 1000,

    // undocumented params are appended to the query string
    hello: 'elasticsearch!'
    }, function (error) {
    if (error) {
      console.trace('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });

  app.route('/api/v2/search').get(function(req,res) {

    var qryObj = JSON.parse(req.query.query);
    console.log('q', qryObj.body);

    elasticSearchClient.ping({
      // ping usually has a 100ms timeout
      requestTimeout: 1000,

      // undocumented params are appended to the query string
      hello: 'elasticsearch!'
      }, function (error) {
      if (error) {
        console.trace('elasticsearch cluster is down!');
      } else {
        console.log('All is well');
      }
    });

    elasticSearchClient.search({
      index: 'datasets',
      body: qryObj.body
    }).then(function(result){
      console.log('res', result);
      res.send(result);
    }, function(err){
      console.log('err',err);
    });
  });
};
