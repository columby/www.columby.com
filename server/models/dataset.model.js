'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Dataset = sequelize.define('Dataset',
    {
      title       : { type: DataTypes.STRING },
      slug        : { type: DataTypes.STRING },
      description : { type: DataTypes.TEXT },
      header_img  : { type: DataTypes.STRING },
      private     : { type: DataTypes.BOOLEAN }

    }, {
      classMethods: {
        associate: function (models) {
          // A dataset can have multiple tags
          DataTypes.hasMany(models.Tags);
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

  return Dataset;
};
