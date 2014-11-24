'use strict';

var Hashids = require('hashids'),
  hashids = new Hashids('Salt', 8);

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Dataset = sequelize.define('Dataset',
    {
      shortid: {
        type: DataTypes.STRING,
        unique: true
      },
      uuid: {
        type: DataTypes.UUID
      },
      title: {
        type: DataTypes.STRING
      },
      slug: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      header_img  : {
        type: DataTypes.STRING
      },
      private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      classMethods: {
        associate: function (models) {
          // A dataset can have multiple tags
          //DataTypes.hasMany(models.Tags);
          // a dataset belongs to a single account
          Dataset.belongsTo(models.Account);
          // a dataset can belong to multiple collections
          Dataset.hasMany(models.Collection);
          // a dataset can have multiple distributions
          Dataset.hasMany(models.Distribution);
        }
      }
    }
  );

  /**
   *
   * Set shortid after creating a new account
   *
   */
  Dataset.afterCreate( function(model) {
    model.updateAttributes({
      shortid: hashids.encode(parseInt(String(Date.now()) + String(model.id)))
    }).success(function(){}).error(function(){});
  });

  return Dataset;
};
