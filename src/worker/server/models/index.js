"use strict";

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var config    = require('./../config/config');
console.log(config.db.cms);

/**
 *
 * Database settings
 *
 **/
var sequelize = new Sequelize(config.db.cms.uri, {
    logging: false,
    define: {
      underscored: true,
      timestamps: true
    }
  }
);


/**
 *
 * Read model files
 *
 **/
var db = {};


fs.readdirSync(__dirname).filter(function(file) {
  return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function(file) {
  var model = sequelize["import"](path.join(__dirname, file));
  db[model.name] = model;
});


/**
 *
 * Create associations for loaded models
 *
 **/
Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
