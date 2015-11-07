'use strict';
// example: http://www.denhaag.nl/ArcGIS/rest/services/Open_services/Kunstobjecten/MapServer/0

var request = require('request'),
  pg = require('pg'),
  escape = require('pg-escape'),
  config = require('../config/config'),
  console = process.console;;


var ArcgisWorker = module.exports = function() {

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

};


ArcgisWorker.prototype.start = function(job,callback){
  var self=this;
  self._job = job;

  connect(function(err) {
    if (err) {
      handleError('There as an error connecting to the DBs.');
      //return callback(err)
    }
    // validate job data
    validateData(function(err) {
      if (err) {
        console.log('There as an error validating the data.',err);
        handleError('There as an error validating the data.');
        //return callback(err)
      }
      // data processing
      process(function (err) {
        if (err) {
          console.log('There as an error processing the data.',err);
          handleError('There as an error processing the data.');
          //return callback(err)
        }
        // finish
        finish(function (err) {
          if (err) {
            console.log('There as an error finishing.',err);
            handleError('There as an error finishing.');
            //return callback(err)
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
   *
   */
  function validateData(callback){

    if (!self._job.data.primaryId) {
      return callback('No primary ID!');
    }
    if (!self._job.data.url) {
      return callback('No access url!');
    }
    console.log('job data: ', self._job.data);
    self._tablename = 'primary_' + self._job.data.primaryId;

    callback();
  }


  /**
   *
   * Drop existing table and initiate
   *
   */
  function process(callback) {

    // drop existing database
    self._connection.data.client.query('DROP TABLE IF EXISTS ' + self._tablename, function (err) {
      if (err) { callback('Error create table if not exist'); }

      // Update job status
      var sql = 'UPDATE "Jobs" SET "status"=\'processing\' WHERE id=' + self._job.data.primaryId;
      self._connection.cms.client.query(sql, function (err) {
        if (err) { callback('Error updating jobstatus. ', err); }
        processData(callback);
      });
    });
  }


  function processData(callback) {
    console.log('Getting stats ...');
    console.log(self._job.data.url);
    request.get({
      url: self._job.data.url + '?f=json&pretty=true',
      json: true
    }, function (err, res, data) {
      if (err) {
        console.log(err);
        callback('Error getting stats');
      } else {
        self._stats = data;
        self._version = data.currentVersion;

        console.log('version', self._version);

        if (!self._version) {
          return callback('No current version found.');
        }

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
        if (self.version === '10.04') {
        }
        if (self.version === '10.11') {
        }
        self._batchParams = batchParams;

        //getids
        console.log('Getting object ids ...');

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
        }, function (err, res, data) {
          if (err) {
            console.log(err);
            callback('Error getting object ids.');
          } else {
            // Sort objectids alphabetically and convert into object
            var data = JSON.parse(data);
            data = data.objectIds;
            data.sort(sortNumber);
            // Add the object id's to the batch
            self._batch = data;
            console.log('Received ' + data.length + ' objectIds.');
            // Start processing the batch
            checkBatch(callback);
          }
        });
      }
    });
  }


  function checkBatch(callback) {
    console.log('Checking batch. ');
    console.log('Batch length: ' + self._batch.length);
    console.log('Batch in Procress: ' + self._batchInProgress);
    if (!self._tableCreated){
      console.log('Table not yet created, creating table.');
      // Create table
      createTable();
    } else if ( (self._batch.length > 0) && (!self._batchInProgress) ){
      console.log('Batch not empty and not in progress, let\'s go!');
      processBatch(function(err){
        if (err){
          return handleError(err);}
      });
    } else if(self._batch.length === 0){
      console.log('Batch all done');
      finish();
    }
  }


  function createTable(callback) {

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

    //console.log('params for cilumns: ', params);

    // GET url (for debugging)
    request.get({
      url: self._job.data.url + '/query',
      qs: params,
      json: true
    }, function(err,res,data) {
      if (err) {
        console.log(err);
        return callback('Error getting data for columns.');
      } else {
        //console.log('Data for columns', data);
        // Process data
        var fields = data.fields;

        // process each field to get columns
        var columnNames = [];
        var columnTypes = [];

        fields.forEach(function (f) {
          // convert esri types to postgis types
          var type = esriconvertable[f.type];
          var value = f.name;
          // create column for the type
          columnNames.push(value);
          columnTypes.push(type);
        });

        console.log('Column names: ', columnNames);
        console.log('Column types: ', columnTypes);
        columnNames = sanitizeColumnNames(columnNames);

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
        console.log('Creating table: ' + sql);

        self._connection.data.client.query(sql, function (err, result) {
          if (err) {
            console.log('error create table if not exist', err);
          } else {
            self._tableCreated = true;
            checkBatch();
          }
        });
      }
    });
  }


  /**
   *
   * Recursively process the current batch
   *
   */
  function processBatch(callback) {
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
      checkBatch();
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
    if (data.features.length<1) {
      console.log('No features in the data.');
      return valueLines;
    }

    // array for all value rows.
    for(var i=0; i<data.features.length; i++){

      var row = data.features[ i];

      var values = [];
      for(var k in row.attributes) {
        values.push(row.attributes[ k]);
      }

      // add current id if OBJECTID field is missing
      if(!self._objectidpresent) {
        values.unshift('1');
      }

      // escape string
      values.forEach(function(v,k) {
        if(!v || v === '') {
          v = 'null';
        } else {
          //v = String(v).replace(/'/g, '\'\'');
          //v = '\'' + escape(String(v)) + '\'';
        }
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

    callback(err);
  }


  function finish() {
    console.log('Finished processing the arcgis job');

    // update Job status
    var sql = 'UPDATE "Jobs" SET "status"=\'done\' WHERE id=' + self._job.id;
    self._connection.cms.client.query(sql, function(err, result) {
      if (err) {
        console.log('Error updating job status: ', err);
      } else {
        console.log('Update result: ', result);
      }
      // update Job status
      sql = 'UPDATE "Primaries" SET "jobStatus"=\'done\' WHERE id=' + self._job.data.primaryId;
      self._connection.cms.client.query(sql, function(err, result) {
        if (err) {
          console.log('Error updating job status: ', err);
        } else {
          console.log('Update result: ', result);
        }
        self._connection.cms.done(self._connection.cms.client);
        self._connection.data.done(self._connection.data.client);

        callback();
      });
    });
  }


  /*-- helpers --*/
  function sortNumber(a,b) {
    return a - b;
  }

};
