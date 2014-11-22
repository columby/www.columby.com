'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Dataset = sequelize.define('Dataset',
    {
      title: {
        type: DataTypes.STRING
      }
    }, {
      classMethods: {
        associate: function (models) {
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
