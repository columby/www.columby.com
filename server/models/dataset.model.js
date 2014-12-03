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
      private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    }, {
      classMethods: {
        associate: function (models) {
          // Header image association
          models.File.hasOne(Dataset, {
            foreignKey: 'headerimg_id',
            as: 'headerImg'
          });
          Dataset.belongsTo(models.File,{
            foreignKey: 'headerimg_id',
            as: 'headerImg'
          });

          // A dataset can have multiple distributions
          // One dataset to Many distributions
          Dataset.hasMany(models.Distribution);
          models.Distribution.belongsTo(Dataset);

          //models.Distribution.belongsTo(Dataset,{
          //  foreignKey: 'dataset_id',
          //  as:'Distributions'
          //});

          // A dataset can have multiple tags
          Dataset.hasMany(models.Tag);
          // a dataset belongs to a single account
          Dataset.belongsTo(models.Account);
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
