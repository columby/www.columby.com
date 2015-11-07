'use strict';

var fs = require('fs'),
  readline = require('readline'),
  stream = require('stream'),
  request = require('request'),
  pg = require('pg'),
  escape = require('pg-escape'),
  config = require('../config/config'),
  Baby = require('babyparse'),
  console = process.console;



var CsvWorker = module.exports = function() {
  var self=this;

  self._tablename = null;
  self._remoteFile = null;
  self._localFile = null;
  self._processingError = false;

  // csv processing variables
  self._rl = null;                    // Readline interface
  self._lineCounter = 0;              // Counter for the number of processed lines
  self._parsingFinished = false;
  self._columns = [];                 //
  self._batch = [];
  self._batchInProgress = false;
  self._batchSize = 50;
  self._batchedPaused = false;
  self._tableCreated = false;

};


/**
 *
 * Create a new job and process it.
 *
 * @param job
 * @param callback
 */
CsvWorker.prototype.start = function(job,callback){

  var self=this;
  self._job = job;

  connect(function(err) {
    if (err) {
      handleError('There as an error connecting to the DBs.');
      return callback(err)
    }
    // validate job data
    validateData(function(err) {
      if (err) {
        console.log('There as an error validating the data.',err);
        handleError('There as an error validating the data.');
        return callback(err)
      }
      // data processing
      process(function (err) {
        if (err) {
          console.log('There as an error processing the data.',err);
          handleError('There as an error processing the data.');
          return callback(err)
        }
        // finish
        finish(function (err) {
          if (err) {
            console.log('There as an error finishing.',err);
            handleError('There as an error finishing.');
            return callback(err)
          }
          // complete
          callback(err);
        });
      });
    });
  });


  /**
   * Connect to CMS and GEO db
   *
   * @param callback
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
   * @param callback
   * @returns {*}
   */
  function validateData(callback){

    if (!self._job.data.primaryId) {
      return callback('No primary ID!');
    }

    self._tablename = 'primary_' + self._job.id;

    callback();
  }


  /**
   *
   * Drop existing table and download file
   *
   */
  function process(callback){

    // drop existing database
    var sql = 'DROP TABLE IF EXISTS "' + self._tablename + '";';
    console.log('Dropping table: ', sql);
    self._connection.data.client.query(sql,function(err,result) {
      if (err) {
        console.log('err', err);
        callback(err);
      }
      console.log('Downloading file to local disk');
      self._localFile = config.root + '/server/tmp/' + self._job.data.primaryId;
      var ws = fs.createWriteStream(self._localFile);
      // request the file from a remote server
      var rem = request(self._job.data.fileUrl);
      rem.on('data', function (chunk) {
        ws.write(chunk);
      }).on('finish', function (err) {
        console.log('Finish error ', err);
        return callback(err);
      }).on('end', function(){
        processData(callback)
      })

    });
  }


  /**
   *
   * Process a local file to csv lines.
   *
   **/
  function processData(callback){
    var instream = fs.createReadStream(self._localFile);
    var outstream = new stream;
    outstream.readable = true;
    self._rl = readline.createInterface({
      input: instream,
      output: outstream
    });

    self._rl.on('line', function (line) {
      // Stop processing if there was already a processing error
      if (!self._processingError) {
        // Parse the line
        self._lineCounter++;
        var parsedLine = Baby.parse(line);
        if (parsedLine.errors.length > 0) {
          // handle error and stop processing
          console.log('There was an error processing.', parsedLine.errors);
          //self._processingError = true;
          return callback(parsedLine.errors);
        } else if (self._lineCounter === 1) {
          console.log('Parsing first line');
          self._columns = parsedLine.data[0];
          // create table
          self.createTable(function(err){
            checkBatch(callback);
          });
        } else {
          // process single line
          var l = parsedLine.data[0];
          if (l.length !== self._columns.length) {
            console.log('Field count ' + l.length + ' does not match column count ' + self._columns.length + '.');
            //return callback('Field count ' + l.length + ' does not match column count ' + self._columns.length + '.');
          } else {
            // add the line to the batch
            // batch will start after creating the table;
            self._batch.push(parsedLine.data[0]);
            // Try processing the batch
            checkBatch(callback);
          }
        }
      }
    }).on('close', function () {
      console.log('Closing readline');
      // send final lines
      self._parsingFinished = true;
      checkBatch(callback);
    });
  }


  /**
   *
   * Save a batch of rows to the database.
   *
   */
  function checkBatch(callback) {

    // Batch not empty, not processing
    if ((self._batch.length>0 ) &&  (!self._batchInProgress)) {
      console.log('Batch not empty, not processing, let\'s go!');
      processBatch(function(err){
        if (err){ callback(err);}
      });
    }

    // Batch empty, done processing
    if ( (self._batch.length===0 ) && self._parsingFinished & !self._batchInProgress) {
      console.log('Batch empty, done processing');
      finish();
    }
  }


  /**
   *
   * Process a part of the batch.
   *
   * @param callback
   */
  function processBatch(callback){
    console.log('processing batch ' + self._batch.length);
    if (self._batch.length>0){
      self._batchInProgress = true;
      var workBatch = self._batch.splice(0, self._batchSize);
      console.log('Workbatch length: ' + workBatch.length + ', remaining: ' + self._batch.length);
      sendRows(workBatch, function(err){
        if (err){ return callback(err);}
        processBatch();
      });
    } else {
      self._batchInProgress=false;
      checkBatch();
    }
  }


  /**
   *
   * Send rows to data db.
   *
   * @param rows
   * @param callback
   */
  function sendRows(rows, callback){

    var buildStatement = function(rows) {
      var params = [];
      var chunks = [];
      for(var i = 0; i < rows.length; i++) {
        var row = rows[ i];
        var valuesClause = [];
        for (var k=0;k<self._columns.length;k++) {
          params.push(row[ k]);
          valuesClause.push('$' + params.length);
        }
        chunks.push('(' + valuesClause.join(', ') + ')')
      }
      return {
        text: 'INSERT INTO ' + self._tablename + ' (' + self._columns.join(',') + ') VALUES ' + chunks.join(', '),
        values: params
      }
    };

    // Execute the query
    console.log('Inserting ' + rows.length + ' rows.');
    var r = buildStatement(rows);
    self._connection.data.client.query(r, function(err, result){
      console.log('Batch inserted. ');
      callback(err);
    });
  }


  /**
   *
   * Processing finished, update cms and return to main processor.
   *
   */
  function finish(){
    console.log('Finished');

    // update Job status
    var sql = 'UPDATE "Jobs" SET "status"=\'done\' WHERE id=' + self._job.id;
    self._connection.cms.client.query(sql);

    // update Job status
    var sql = 'UPDATE "Primaries" SET "jobStatus"=\'done\' WHERE id=' + self._job.data.primaryId;
    self._connection.cms.client.query(sql);


    self._connection.cms.done(self._connection.cms.client);
    self._connection.data.done(self._connection.data.client);
    self._rl.close();

    callback();
  }

  function handleError(msg){

    console.log('Error!');
    console.log(msg);

    var sql = 'UPDATE "Primaries" SET "jobStatus"=\'error\',"statusMsg"=\'' + msg+ '\' WHERE id=' + self._job.data.primaryId + ';';
    self._connection.cms.client(sql),function(err,res){
      console.log(err);
      console.log(res);
    };

    self._connection.cms.done(self._connection.cms.client);
    self._connection.data.done(self._connection.data.client);
    self._rl.close();
  }
};




/**
 *
 * Validate and save columns to a new database table.
 *
 */
CsvWorker.prototype.createTable = function(callback){
  var self=this;
  if (!self._columns){
    return handleError('There was an error parsing the columns. ');
  }
  var sc = self.sanitizeColumnNames();
  // assume all text column types for now.
  sc = sc.join(' text, ') + ' text';

  var sql = 'CREATE TABLE IF NOT EXISTS ' + self._tablename + ' (cid serial PRIMARY KEY, ' + sc + ', "created_at" timestamp, "updated_at" timestamp);';
  console.log('Creating table: ', sql);

  self._connection.data.client.query(sql, function(err){
    if (err) {
      console.log(err);
      return callback(err);
    }
    console.log('Table created.');
    self._tableCreated=true;
    callback();
  });
};


/**
 *
 * Make sure column names are valid for postgres
 *
 */
CsvWorker.prototype.sanitizeColumnNames = function(){
  var fields = [];

  this._columns.forEach(function(field) {
    field = '"_' + field.replace(' ', '_').replace('.', '_').toLowerCase() + '"';
    fields.push(field);
  });

  this._columns = fields;

  return this._columns;
};
