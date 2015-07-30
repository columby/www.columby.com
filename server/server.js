'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    bodyParser = require('body-parser');

var app = express();
app.set('port', 9000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

if ( (process.env.NODE_ENV === 'staging') || (process.env.NODE_ENV==='production') ) {
  app.use(express.static(path.join(__dirname, '../client')));
  app.all('/*', function(req,res,next) {
    res.sendFile(path.resolve(path.join(__dirname, '../client/index.html')));
  });
} else {
  app.use(express.static(path.join(__dirname, '../.tmp')));
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(morgan('dev'));
  app.all('/*', function(req,res,next) {
    res.sendFile(path.resolve(path.join(__dirname, '../client/index.html')));
  });
}


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
