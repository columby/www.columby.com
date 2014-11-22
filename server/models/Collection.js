'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Collection = sequelize.define('Collection',
    {
      title: { type: DataTypes.STRING }

    },{
      classMethods: {
        associate: function(models) {
          Collection.belongsTo(models.Account);
          Collection.hasMany(models.Dataset);
        }
      }
    }
  );

  return Collection;
};
