'use strict';

var fs = require('fs');
var path=require('path');
var logger = require('winston');

module.exports = function(app) {

  fs.readdirSync(__dirname).forEach(function(file) {
    if ((file === 'index.js') || (file[0] === '.')) { return; }
    var name = file.substr(0, file.indexOf('.'));
    require('./' + name + '.routes')(app);
  });

  logger.debug('done!');

  app.route('/').get(function(req,res){
    return res.json({statusCode: 200, msg:'Columby API'});
  });

  app.route('/*')
    .get(function(req,res){
      return res.json({status: 'not found'});
    });
};
