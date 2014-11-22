'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Account = sequelize.define('Account',
    {
      displayName: { type: DataTypes.STRING }

    },{
      classMethods: {
        associate: function(models) {
          Account.belongsTo(models.User);
          Account.hasMany(models.Dataset);
          Account.hasMany((models.Distribution))
        }
      }
    }
  );

  return Account;
};
