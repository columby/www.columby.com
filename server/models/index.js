"use strict";

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var config    = require('./../config/environment');

var sequelize = new Sequelize(
  config.db.mysql.database_name,
  config.db.mysql.user,
  config.db.mysql.password, {
    dialect: 'postgres', // or 'sqlite', 'postgres', 'mariadb'
    port:    config.db.mysql.port, // or 5432 (for postgres)
    define: {
      underscored: true
    }
  }
);

sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Postgres; Connection has been established successfully.')
    }
  });
// export connection
//module.exports.sequelize = sequelize;

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


if (config.env === 'development'){
  sequelize
    .sync({ force: true })
    .complete(function(err) {
      if (!!err) {
        console.log('An error occurred while creating the table:', err)
      } else {
        console.log('It worked!')
      }
    });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
