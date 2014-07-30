'use strict';

// The Package is past automatically as first parameter
module.exports = function(Columby, app, auth, database) {

  app.get('/columby/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/columby/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/columby/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/columby/example/render', function(req, res, next) {
    Columby.render('index', {
      package: 'columby'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
