'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Account = sequelize.define('Account', {
      name        : { type: DataTypes.STRING },
      description : { type: DataTypes.TEXT },
      avatar      : { type: DataTypes.STRING },
      primary     : { type: DataTypes.BOOLEAN }
    },{
      classMethods: {
        associate: function(models) {
          // An account can have multiple accounts with roles
          Account.hasMany(models.User, {through: models.AccountsUsers });
          Account.hasMany(models.Dataset);
          Account.hasMany((models.Distribution))
        }
      }
    }
  );

  return Account;
};
