(function(){

  'use strict';
  var config = require('./../config/config');
  var fileCtrl = require('./../controllers/file.controller');
  var auth = require('./../controllers/auth.controller');

  module.exports = function (app) {

    // Serve static assets
    app.get('/assets/:filename', fileCtrl.serveAsset);

    // Serve original file
    app.get('/f/:id/:filename', fileCtrl.serveFile);

    // Serve file derivative
    app.get('/s/:style/:id/:filename', fileCtrl.serveStyle);

    // Fallback for all other routes
    app.get('/', function (req, res) {
      var status = {
        status: 'ok',
        statusCode: 200,
        msg: 'Columby file server.',
        appVersion: config.appVersion
      };
      if (config.env === 'development') {
        status.environment = 'development';
      }
      return res.json(status);
    });

    app.get('/*', function (req, res) {
      return res.sendStatus(404);
    });
  };
})();
