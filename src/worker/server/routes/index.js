'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(app) {

  fs.readdirSync(__dirname).forEach(function(file) {
    if ((file === 'index.js') || (file[0] === '.')) {
      return;
    }
    var name = file.substr(0, file.indexOf('.'));
    require('./' + name + '.routes')(app);
  });


  // Client routes for bower components
  app.route('/bower_components/*').get(function(req,res){
    fs.readFile(path.join(__dirname, '../../../../bower_components/' + req.params[0]), 'binary', function(err, file) {
      if (err) {
        res.writeHeader(500, {'Content-Type': 'text/plain'});
        res.write(err + '\n');
        res.end();
      } else {
        res.writeHeader(200);
        res.write(file, 'binary');
        res.end();
      }
    });
  });


  //All other routes should redirect to the index.html
  app.route('/*').get(function(req,res) {
    console.log('all');
    return res.render('index');
  });
};
