'use strict';

var pg = require('pg'),
    escape = require('pg-escape'),
    config = require('../../config/config');

exports.query = function(req,res) {

  // Connect to the geoDatabase
  // Todo: permanent connection?
  var postgisConn = config.db.postgis.uri;
  if (!postgisConn) {
    return res.json({status: 'error', message: 'No postgis database connection details.'});
  }

  var q = JSON.parse(req.query.q);
  //console.log(q);

  // Validate for required query elements
  if (!q.table) {
    return res.json({status: 'error', message: 'Tablename is required.'});
  }
  if (!q.type || q.type.toLowerCase() !== 'select') {
    return res.json({status: 'error', message: 'Only SELECT statement supported.'});
  }

  var r = {};
  r.type   = q.type || 'select';
  r.table  = 'primary_' + String(q.table);
  r.fields = q.fields || '*';
  r.limit  = parseInt(q.limit) || 1000;
  r.offset = parseInt(q.offset) || 0;
  if (r.limit>1000) { r.limit=1000; }

  // query validation passed, create query string
  var sql = escape('SELECT ' + r.fields + ' FROM ' + r.table + ' OFFSET ' + r.offset + ' LIMIT ' + r.limit +';');


  // connect to the geo-db
  pg.connect(postgisConn, function (err, client, done) {
    if (err) { return res.json({status: 'error', message: 'There was an error connecting to the database. ', err:err}); }

    client.query(sql, function(err, result) {
      done();
      if (err){ return res.json({status:'error', message: String(err)}); }

      // Create header
      var h = [];
      if (result.rows.length>0){
        var obj = result.rows[0];
        for(var k in obj) h.push(k);
        //var k = result.rows[ 0].length;
        for (var i=0; i<result.rows[ 0].length; i++) {
          var th = result.rows[ 0][ i];
          th = th.substr(1);
          h.push(th);
        }
      }
      //console.log(h);
      return res.json({
        rows: result.rows,
        header: h
      });
    });
  });
};
