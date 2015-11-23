/***
 *
 * Start
   - Clear list
   - Start interval
   -- fetchJob
   --- initializeJob
   --- processJob ()
   --- finishJob
 ***/



'use strict';

var pg = require('pg'),
    csvWorker = require('../workers/csv.worker'),
    arcgisWorker = require('../workers/arcgis.worker'),
    fortesWorker = require('../workers/fortes.worker'),
    request = require('request'),
    console = process.console;


function Worker(cb) {
  console.log('initiating Worker.');
  var self = this;

  // Get configuration options from app's config file
  var conf = require('../config/config');

  // Set options
  self._config       = conf || {};
  self._processEvery = self._config.processEvery || '5000';
  self._processing   = false;
  self._job          = {};
  self._connection   = null;
  // setup the database connection
  pg.connect(self._config.db.cms.uri, function(err,client,done){
    if (err) { console.log('Error connecting to the database, ', err); }
    self._connection = {
      client: client,
      done: done
    };
    cb(err);
  });
}


// Start the worker
Worker.prototype.start = function() {
  var self = this;
  self.clearProcessingList(function(err){
    // Check for Error

    // Start the worker
    console.log('Starting worker.');
    if (!self._processInterval) {
      console.log('Setting process interval: ' + self._processEvery/1000 + ' sec');
      self._processInterval = setInterval(self.processJob.bind(self), self._processEvery);
      process.nextTick(self.processJob.bind(self));
      console.log('Worker started.');
    } else {
      console.log('Worker already running.');
    }
  });
};


// Stop the worker
Worker.prototype.stop = function(cb) {
  cb = cb || function() {};
  clearInterval(this._processInterval);
  this._processInterval = undefined;
  //this._unlockJobs( cb );
};


// Set possible strained jobs to error.
Worker.prototype.clearProcessingList = function(cb) {
  // Clear jobs in progress and set them to error state.
  console.log('Clearing list');
  // First clear the existing job list to clear stranded jobs
  var sql='UPDATE "Jobs" SET status=$1, error=$2 WHERE status=$3';
  var values = ['error','Processor restarted','processing'];
  this._connection.client.query({text: sql, values: values}, function(err, result) {
    if (err) {
      console.log('Error clearing jobs list: ', err);
      cb(err);
    }
    console.log('Clearing list finished. Rows affected: ' +  result.rowCount);
    cb();
  });
};


// Check for a job and process it
Worker.prototype.processJob = function() {
  //console.log('Looking for a new job.');

  var self=this;

  // Check if process is already running
  if (self._processing) {
    //return self.handleProcessedJob('Already processing. ');
    return;
  }

  // turn on processing flag
  self._processing = true;

  // select the next job in queue
  var sql =
    'SELECT * FROM "Jobs" ' +
      'WHERE "Jobs"."status"=\'active\' ' +
      'ORDER BY "created_at" DESC ' +
      'LIMIT 1';
  self._connection.client.query(sql, function(err, result){

    // return and turn off processing flag if error.
    if (err) {
      console.log('Error connecting to the cms-client', err);
      self._processing=false;
      return self.handleProcessedJob(err);
    }
    //console.log('Job query result ', result.rows);
    // Set the new job
    self._job = result.rows[ 0];
    // Return if no job found
    if (!self._job){
      self._processing=false;
      return;
    }

    // Determine job type and process it
    var sql;
    switch(self._job.type){
      case 'csv':
        // get file url
        sql = 'SELECT ' +
            '"Primaries".id AS "primaryId", ' +
            '"Distributions".id AS "distributionId", '+
            '"Files".id AS "fileId", ' +
            '"Files".url AS "fileUrl" ' +
          'FROM "Primaries" ' +
            'LEFT JOIN "Distributions" ' +
              'ON "Primaries"."distribution_id"="Distributions"."id" ' +
            'LEFT JOIN "Files"' +
              'ON "Files".id="Distributions"."file_id"' +
          'WHERE "Primaries".dataset_id=' + self._job.dataset_id;
        break;
      case 'arcgis':
        // get url
        sql = 'SELECT ' +
            '"Primaries".id AS "primaryId", ' +
            '"Distributions".id AS "distributionId", ' +
            '"Distributions"."accessUrl" AS "url" '+
          'FROM "Primaries" ' +
            'LEFT JOIN "Distributions" ' +
              'ON "Primaries"."distribution_id"="Distributions"."id" ' +
          'WHERE "Primaries".dataset_id=' + self._job.dataset_id;
        break;
      case 'fortes':
        sql=
          'SELECT ' +
            '"Primaries".id AS "primaryId", ' +
            '"Distributions".id AS "distributionId" '+
          'FROM "Primaries" ' +
            'LEFT JOIN "Distributions" ' +
              'ON "Primaries"."distribution_id"="Distributions"."id" ' +
          'WHERE "Primaries".dataset_id=' + self._job.dataset_id;
        break;
      default:
        return self.handleProcessedJob('Job type '+ self._job.type +' not found for job id: ' + self._job.id);
    }

    self._connection.client.query(sql, function(err,result) {
      // Handle error
      if (err) {
        return self.handleProcessedJob(err);
      } else if (!result.rows[ 0]){
        return self.handleProcessedJob('No valid record found. ');
      } else if (result.rows[0]) {
        self._job.data = result.rows[0];
      }

      switch(self._job.type) {
        case 'csv':
          var csv = new csvWorker();
          csv.start(self._job, self.handleProcessedJob());
        break;
        case 'arcgis':
          var arcgis = new arcgisWorker();
          arcgis.start(self._job, function(result) {
            console.log('Arcgisworker done');
            console.log(result);
            self.handleProcessedJob();
          });
        break;
        case 'fortes':
          var fortes = new fortesWorker();
          fortes.start(self._job, self.handleProcessedJob());
        break;
      }
    });
  });
};


// Handler for when a job is finished processing.
Worker.prototype.handleProcessedJob = function(err) {
  var self=this;
  console.log('handling processed job');
  console.log(self._job.data);

  self._processing = false;

  // Handle error
  if (err) {
    console.log('There was an error', err);
    console.log('Setting error in Job');
    var sql='UPDATE "Jobs" SET status=\'error\', error='+err+' WHERE id=' + self._job.id;
    self._connection.client.query(sql, function(err,result) {
      if (err) { console.log('err',err);}
      console.log('Processing done for Job: ' + self._job.id);
    });
  }

  // Handle success
  else {
    // Update status
    var sql = 'UPDATE "Jobs" SET status=\'done\', error=NULL WHERE id=' + self._job.id;
    self._connection.client.query(sql, function(err,result) {
      if (err) { console.log('err',err);}
    });

    // Create a downloadable file for this table
    var apiRoot = 'https://api.columby.com/v2/primary/';
    if (self._config.env === 'development') {
      apiRoot = 'https://dev-api.columby.com/v2/primary/';
    }
    if (self._config.env === 'local') {
      apiRoot = 'http://localhost:8000/v2/primary/';
    }
    console.log('sending for file processing: ' + self._job.data.primaryId + ' to: ' + apiRoot);
    var job = self._job;
    console.log('job, ', job);
    request.post({
      url: apiRoot + 'convert',
      form: {
        primary_id: self._job.data.primaryId
      }
    }, function(error, response, data) {
      if (error) { console.log('Error: ', err); }
      console.log(data);
      data = JSON.parse(data);
      console.log('data ', data);
      // Update Primary
      var sql = 'UPDATE "Jobs" SET status=\'done\', error=NULL WHERE id=' + job.id;
      self._connection.client.query(sql, function(err,result) {
        if (err) { console.log('err',err);}
      });
      // Update Job
      sql = 'UPDATE "Primary" SET file_id='+data.file.id+' WHERE id=' + job.id;
      self._connection.client.query(sql, function(err,result) {
        if (err) { console.log('err',err);}
      });

    });
  }
};


module.exports = Worker;
