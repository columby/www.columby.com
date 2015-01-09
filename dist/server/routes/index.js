'use strict';


module.exports = function(app) {

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(function (req, res) {
      var viewFilePath = '404';
      var statusCode = 404;
      var result = {
        status: statusCode
      };

      res.status(result.status);
      res.render(viewFilePath, function (err) {
        if (err) { return res.json(result, result.status); }

        res.render(viewFilePath);
      });
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};

