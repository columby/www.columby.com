'use strict';
// example: http://www.denhaag.nl/ArcGIS/rest/services/Open_services/Kunstobjecten/MapServer/0


/***
 *
   Start
   - Connect
   -- Validate
   --- StartProcessData
   ---- ProcessData
 ***/
var request = require('request'),
  pg = require('pg'),
  escape = require('pg-escape'),
  config = require('../config/config');


function ArcgisWorker() {

  var self=this;

  self._job             = null; 		// job
  self._connection      = null;
  self._total           = null;			// total rows external dataset
  self._version         = null;     // dataset version
  self._stats           = null;			// dataset arcgis stats
  self._batch           = null;			// all dataset ids
  self._batchSize       = 100;
  self._objectidpresent = true;
  self._tablename       = null;
  self._chunk_size      = 100;		  // chunk size scrape (rows per cycle)
  self._columns         = [];
  self._columnTypes     = [];
  self._geoColumn       = null;     //
}


ArcgisWorker.prototype.start = function(job, callback) {
  console.log('Starting job: ', job);
  var self=this;
  // Add job to self
  self._job = job;

  // Add the main callback to self
  self._callback = callback;

  // Connect to the database
  connect(function(err) {
    if (err) { return handleError('There was an error connecting to the DBs.'); }
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
          getStats(function(err){
            if (err) { return handleError(err); }
            // Get a list of object id's
            getObjectIds(function(err){
              if (err) { return handleError(err); }
              // Create the new table
              createTable(function(err){
                if (err) { return handleError(err); }
                // Process the data batch
                processData(function(err){

                });
              });
            });
          });
        });
      });
    });
  });


  // Connect to CMS and GEO db
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

  // Validate if required elements in job are present.
  function validateData(cb){

    if (!self._job.data.primaryId) {
      return cb('No primary ID!');
    }
    if (!self._job.data.url) {
      return cb('No access url!');
    }
    console.log('job data: ', self._job.data);
    self._tablename = 'primary_' + self._job.data.primaryId;

    cb();
  }

  // Drop existing table
  function dropTable(cb) {
    console.log('Dropping table ' + self._tablename);
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

  // Get statistics about the arcgis from the external url
  function getStats(cb) {
    console.log('Getting stats ...');
    var url = self._job.data.url + '?f=json&pretty=true';
    console.log('Stats url: ' + url);
    request.get({
      url: url,
      json: true
    }, function(err, res, data) {
      if (!err) {
        console.log('Stats data received. ');
        self._stats = data;
        self._version = data.currentVersion;
        console.log('version', self._version);
        if (!self._version) {
          err = 'No current version found.';
        }
      }
      cb(err);
    });
  }

  // Get the list of object ids from the external url
  function getObjectIds(cb) {

    console.log('Setting batch params.');
    // set batchParams based on version
    var batchParams = {
      f: 'pjson',
      where: '1=1',
      returnIdsOnly: 'false',
      text: '',
      returnGeometry: 'true',
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      outSR: '4326'
    };
    self._batchParams = batchParams;


    console.log('Getting object id\'s.');

    var params = {
      f: 'pjson',
      objectIds: '',
      where: '1=1',
      returnIdsOnly: 'true',
      text: '',
      returnGeometry: 'false',
      json: 'true'
    };
    request.get({
      url: self._job.data.url + '/query',
      qs: params
    }, function(err, res, data) {
      if (!err) {
        data = JSON.parse(data);
        data = data.objectIds;
        data.sort(sortNumber);
        // Add the object id's to the batch
        self._batch = data;
        console.log('Received ' + data.length + ' objectIds.');
      } else {
        console.log(err);
      }
      cb(err);
    });
  }

  // Create table
  function createTable(cb) {
    console.log('Creating table ' + self._tablename);
    var esriconvertable = {
      esriFieldTypeSmallInteger : 'TEXT',
      esriFieldTypeInteger  	  : 'TEXT',
      esriFieldTypeSingle     	: 'TEXT',
      esriFieldTypeDouble   	  : 'TEXT',
      esriFieldTypeString     	: 'TEXT',
      esriFieldTypeDate	 		    : 'TEXT',
      esriFieldTypeOID	  		  : 'TEXT',
      esriFieldTypeGeometry 	  : 'TEXT',
      esriFieldTypeBlob	 		    : 'TEXT',
      esriFieldTypeRaster   	  : 'TEXT',
      esriFieldTypeGUID	 		    : 'TEXT',
      esriFieldTypeGlobalID 	  : 'TEXT',
      esriFieldTypeXML	  		  : 'TEXT',
      Latitude	  				      : 'TEXT'
    };

    // Get columns from requests
    // using ?f=json&pretty=true' returns more columns sometimes, so we make a separate query
    // Get records
    var params = {
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      where: '1=1',
      returnCountOnly: 'false',
      returnIdsOnly: 'false',
      returnGeometry: 'true',
      outSR: '4326',
      outFields: '*',
      f: 'pjson',
      objectIds: self._batch[ 0]
    };

    // GET url (for debugging)
    request.get({
      url: self._job.data.url + '/query',
      qs: params,
      json: true
    }, function(err,res,data) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      // Process data
      var fields = data.fields;
      // process each field to get columns.
      var columnNames = [];
      var columnTypes = [];
      fields.forEach(function(f) {
        // convert esri types to postgis types.
        var type = esriconvertable[f.type];
        var value = f.name;
        columnNames.push(value);
        columnTypes.push(type);
      });

      // Sanitize column names for postgresql.
      columnNames = sanitizeColumnNames(columnNames);
      // Check for required objectID and add if needed.
      if (columnNames.indexOf('"_objectid"') === -1) {
        console.log('ObjectId is not present, adding it to the column list.');
        self._objectidpresent = false;
        columnNames.push('_objectid');
        columnTypes.push('TEXT');
      }
      console.log('Sanitized columns: ', columnNames);

      // Add geometry and dates
      self._geoColumn = columnNames.length;
      columnNames.push('the_geom');
      columnTypes.push('geometry');

      columnNames.push('created_at');
      columnTypes.push('timestamp');
      columnNames.push('updated_at');
      columnTypes.push('timestamp');

      self._columns = columnNames;
      self._columnTypes = columnTypes;

      // create columns
      var columns = [];
      columnNames.forEach(function (v, k) {
        columns.push(v + ' ' + columnTypes[k]);
      });

      // create table if not exists
      var sql = 'CREATE TABLE IF NOT EXISTS ' + self._tablename + ' (cid serial PRIMARY KEY, ' + columns + ')';

      self._connection.data.client.query(sql, function (err, result) {
        if (err) {
          console.log('Error create table if not exist', err);
          return cb(err);
        } else {
          self._tableCreated = true;
          console.log('Table created.');
          return cb();
        }
      });
    });
  }

  // Process the data batch
  function processData(cb) {
    console.log('** ProcessData **');
    console.log('Batch length: ' + self._batch.length);

    if ( (self._batch.length > 0) && (!self._batchInProgress) ) {
      console.log('Batch not empty and not in progress, let\'s go!');
      processBatch();
    } else if(self._batch.length === 0){
      console.log('Batch all done');

      finish();

    } else {
      console.log('Items in batch, but also processing... ');
    }
  }


  // Recursively process the current batch
  function processBatch(cb) {
    console.log('Processing batch with size: ' + self._batch.length);
    if (self._batch.length>0){
      self._batchInProgress = true;
      var workBatch = self._batch.splice(0, self._batchSize);
      console.log('Workbatch length: ' + workBatch.length + ', remaining in batch: ' + self._batch.length);
      sendRows(workBatch, function(err){
        if (err){ return callback(err);}
        self._batchInProgress=false;
        processBatch();
      });
    } else {
      self._batchInProgress=false;
      processData();
    }
  }


  function sendRows(rows, callback){
    console.log('Send rows:', rows.length);

    // Get records
    var params = {
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      where: '1=1',
      returnCountOnly: 'false',
      returnIdsOnly: 'false',
      returnGeometry: 'true',
      outSR: '4326',
      outFields: '*',
      f: 'pjson',
      objectIds: rows.join(',')
    };

    //console.log(params);

    // GET url (for debugging)
    request.get({
      url: self._job.data.url + '/query',
      qs: params,
      json: true
    }, function(err,res,data){
      if (err) {
        console.log(err);
        return callback('Error getting data.');
      } else {
        //console.log('data', data);
        // Process data
        data = processGeodata(data);

        // build query
        var buildStatement = function(rows) {
          // flat array of all values; ["a","b","c","d"]
          var params = [];
          // array with valueClauses per row [ [$1,$2], [$3,$4] ]
          var chunks = [];
          // Process each row
          for(var i = 0; i < rows.length; i++) {
            var row = rows[ i];
            //console.log('Processing row ' + i + ' with length: ' + row.length);
            // container for individual parameters
            var valuesClause = [];
            // Process each element in the row
            for (var k=0; k<row.length; k++) {
              // parse geometry column (https://github.com/brianc/node-postgres/issues/693)
              params.push(row[ k]);
              var value = '$' + params.length;
              if (k === self._geoColumn) {
                value = 'ST_GeomFromText(' + value + ', 4326)';
              }
              //
              valuesClause.push(value);
            }
            chunks.push('(' + valuesClause.join(', ') + ')');
          }
          return {
            text: 'INSERT INTO ' + self._tablename + ' (' + self._columns.join(',') + ') VALUES ' + chunks.join(', '),
            values: params
          };
        };

        var sql = buildStatement(data);
        //console.log('sending SQL: ', sql);
        self._connection.data.client.query(sql, function(err, result) {
          if (err) {
            console.log(err);
            return callback(err);
          } else {
            console.log('inserted ' + data.length + ' rows');
            // if(chunki<self.chunks.length && chunki<self.max_test_chunks){

            return callback();
            //checkBatch();
          }
        });
      }
    });
  }


  function sanitizeColumnNames(columns){
    var fields = [];
    columns.forEach(function(field) {
      field = '"_' + field.replace(' ', '_').replace('.', '_').toLowerCase() + '"';
      fields.push(field);
    });

    return fields;
  }


  function processGeodata(data){

    var valueLines = [];

    // Process data
    if (!data.features || (data.features.length<1) ) {
      console.log('No features in the data.');
      return valueLines;
    }

    // array for all value rows.
    for(var i=0; i<data.features.length; i++){

      var row = data.features[ i];

      var values = [];
      if (row.attributes.lenght>0) {
        for(var k in row.attributes) {
          values.push(row.attributes[ k]);
        }
      }

      // add current id if OBJECTID field is missing
      if(!self._objectidpresent) {
        values.unshift('1');
      }

      // escape string
      values.forEach(function(v,k) {
        if(!v || v === '') {
          v = 'null';
        }
        // else {
          //v = String(v).replace(/'/g, '\'\'');
          //v = '\'' + escape(String(v)) + '\'';
        // }
        values[ k] = v;
      });

      // get geodata
      if (row.geometry) {
        if (row.geometry.x && row.geometry.y) {
          values.push('POINT(' + row.geometry.x + ' ' + row.geometry.y + ')');
        } else if (row.geometry.rings) {
          var points = [];
          row.geometry.rings[ 0].forEach(function(v,k) {
            points.push(v[ 0] + ' ' + v[1]);
          });
          var pointString = points.join(',');
          values.push('POLYGON((' + pointString + '))');
        } else {
          values.push('null');
        }
      } else {
        values.push('null');
      }

      // set dates
      var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      values.push(now);  // createdAt
      values.push(now);  // updatedAt

      // add to valueLines
      valueLines.push(values);
    }

    return valueLines;
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


  function finish(cb) {
    console.log('Finished processing the arcgis job');

    // update Job status
    var sql = 'UPDATE "Jobs" SET "status"=\'done\' WHERE id=' + self._job.id;
    self._connection.cms.client.query(sql, function(err, result) {
      if (err) {
        console.log('Error updating job status: ', err);
      } else {
        console.log('Job status updated to Done.');
      }
      // update Job status
      sql = 'UPDATE "Primaries" SET "jobStatus"=\'done\' WHERE id=' + self._job.data.primaryId;
      self._connection.cms.client.query(sql, function(err, result) {
        if (err) {
          console.log('Error updating job status: ', err);
        } else {
          console.log('Primary updated to Done.');
        }
        self._connection.cms.done(self._connection.cms.client);
        self._connection.data.done(self._connection.data.client);

        self._callback(err);
      });
    });
  }


  /*-- helpers --*/
  function sortNumber(a,b) {
    return a - b;
  }

};

module.exports = ArcgisWorker;
