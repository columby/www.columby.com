'use strict';

var request = require('request'),
  pg = require('pg'),
  escape = require('pg-escape'),
  //copyFrom = require('pg-copy-streams').from,
  config = require('../config/config');



var FortesWorker = module.exports = function() {
  var self=this;

  self._tablename = null;
  self._columns = [];
  self._batch = [];
  self._batchInProgress = false;
  self._batchSize = 50;
  self._batchedPaused = false;
  self._tableCreated = false;
};


FortesWorker.prototype.start = function(job,callback) {
  console.log('Starting job: ', job);

  var self = this;
  self._job = job;

  // Add the main callback to self
  self._callback = callback;

  // Connect to the database
  connect(function(err) {
    if (err) { return handleError('There as an error connecting to the DBs.'); }
    // Validate job data
    validateData(function(err) {
      if (err) { return handleError('There as an error validating the data.'); }
      // Drop existing table if present
      dropTable(function(err){
        if (err) { return handleError(err); }
        // Update Job status to processing
        updateJobStatus('processing', function(err){
          if (err) { return handleError(err); }
          // Get stats about the url
          getData(function(err) {
            if (err) { return handleError(err); }
            createTable(function(err){
              if (err) { return handleError(err); }
              // Process the data batch
              processData(function(err){
                if (err) { return handleError(err); }
                finish(function(err){
                  callback(err);
                });
              });
            });
          });
        });
      });
    });
  });


  /**
   * Connect to CMS and GEO db
   *
   */
  function connect(callback) {
    self._connection = {};
    // Connect to cms
    pg.connect(config.db.cms.uri, function (err, client, done) {
      if (err) { return callback(err); }
      console.log('Connected to CMS DB');
      self._connection.cms = {
        client: client,
        done: done
      };
      // Connect to postgis
      pg.connect(config.db.postgis.uri, function (err, client, done) {
        if (err) { return callback(err); }
        console.log('Connected to Data DB.');
        self._connection.data = {
          client: client,
          done: done
        };
        callback();
      });
    });
  }


  /**
   *
   * Validate if required elements in job are present.
   *
   */
  function validateData(cb){
    if (!self._job.data.primaryId) {
      return cb('No primary ID!');
    }
    console.log('job data: ', self._job.data);
    self._tablename = 'primary_' + self._job.data.primaryId;

    cb();
  }


  // Delete columby data-table
  function dropTable(cb){
    console.log('Deleting existing table.');
    self._connection.data.client.query('DROP TABLE IF EXISTS ' + self._tablename, function(err) {
      if (err) { console.log(err); } else { console.log('Table dropped. '); }
      cb(err);
    });
  }

  // Update job status
  function updateJobStatus(status, cb){
    var sql = 'UPDATE "Jobs" SET "status"=\'' + status + '\' WHERE id=' + self._job.data.primaryId;
    self._connection.cms.client.query(sql, function(err) {
      cb(err);
    });
  }

  function getData(cb) {
    if (!config.fortes.username || !config.fortes.password || !config.fortes.url) {
      return callback('Missing fortes config parameters. ');
    }
    console.log(config.fortes);
    console.log('Sending data request to fortes for user: ' + config.fortes.username);
    request.get(config.fortes.url, {
      'auth': {
        'user': config.fortes.username,
        'pass': config.fortes.password,
        'sendImmediately': false
      }
    }, function(err, res, body){
      if (err) { return callback(err); }
      console.log('Response received from fortes.');
      //console.log(body);
      var data;
      try {
        data = JSON.parse(body);
      } catch(e){
        console.log(e);
      }
      console.log('json', data);
      self._data = data;

      return cb();
    });
  }

  function createTable(cb) {    // transform into array
    var dataArray = [];
    for( var i in self._data ) {
      if (self._data.hasOwnProperty(i)){
        dataArray.push(self._data[i]);
      }
    }
    self._dataArray = dataArray;
    console.log(dataArray);

    // create columns
    self._columns = Object.keys(dataArray[ 0]);
    console.log('Columns, ', self._columns);
    console.log('Creating table');
    var columns = self._columns.join(' TEXT, ');
    columns += ' TEXT, "created_at" timestamp, "updated_at" timestamp';
    var sql='CREATE TABLE IF NOT EXISTS ' + self._tablename + ' (cid serial PRIMARY KEY, ' + columns + ');';
    console.log('sql', sql);
    console.log(self._connection.data.client);
    self._connection.data.client.query(sql, function(err, result) {
      console.log('Create table result: ', result);
      return cb(err);
    });
  }


  function processData(cb) {
    var result = [];
    // create data
    for (var i=0; i<self._dataArray.length; i++){
      var obj = self._dataArray[ i];
      var values = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var val = obj[key];
          // use val
          values.push(val);
        }
      }
      result.push(values);
    }
    self._processedData = result;
    console.log('data processed. ');
    //console.log(self._processedData[ 0]);

    console.log('Inserting data. ');
    var columns = self._columns;
    columns.push('"created_at"');
    columns.push('"updated_at"');
    columns = columns.join(', ');
    var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    var valueLines = [];
    for (var k=0; k<self._processedData.length;k++){
      var valueLine = self._processedData[ k];
      valueLine.push(now);
      valueLine.push(now);
      valueLine.forEach(function(value,key){
        if(!value || value === '') {
          value = 'null';
        } else {
          value = String(value).replace(/'/g, "''");
          value = "'" + escape(String(value)) + "'";
        }
        valueLine[ key] = value;
      });
      valueLine = '(' + valueLine.join(', ') + ')';
      valueLines.push(valueLine);
    }
    var sqlvalues = valueLines.join(', ');

    var sql = 'INSERT INTO ' + self._tablename + ' (' + columns + ') VALUES ' + sqlvalues + ';';

    //console.log('sql, ', sql);
    self._connection.data.client.query(sql, function(err){

      cb(err);
    });
  }

  /**
   *
   * Processing finished, update cms and return to main processor.
   *
   */
  function finish(callback){

    console.log('Finished processing the fortes job.');

    // update Job status
    var sql = 'UPDATE "Jobs" SET "status"=\'done\' WHERE id=' + self._job.id;
    self._connection.cms.client.query(sql, function(err){
      if (err) {
        console.log('Error updating job status: ', err);
      } else {
        console.log('Job status updated to Done.');
      }
      // update Job status
      sql = 'UPDATE "Primaries" SET "jobStatus"=\'done\', "syncDate"="now()" WHERE id=' + self._job.data.primaryId;
      self._connection.cms.client.query(sql, function(err) {
        if (err) {
          console.log('Error updating job status: ', err);
        } else {
          console.log('Primary updated to Done.');
        }
        self._connection.cms.done(self._connection.cms.client);
        self._connection.data.done(self._connection.data.client);
        callback();
      });
    });
  }


  function handleError(err){
    console.log('___error___');
    console.log(err);
    // update Job status
    var sql = 'UPDATE "Jobs" SET "status"=\'error\', "error"=\''+ String(err) + '\' WHERE id=' + self._job.id;
    console.log('Updating job status: ' + sql);
    self._connection.cms.client.query(sql);

    // update Primary status
    sql = 'UPDATE "Primaries" SET "jobStatus"=\'error\' WHERE id=' + self._job.data.primaryId;
    console.log('Updating primary status: ' + sql);
    self._connection.cms.client.query(sql);


    self._connection.cms.done(self._connection.cms.client);
    self._connection.data.done(self._connection.data.client);

    self._callback(err);
  }

};
