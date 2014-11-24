'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var User = sequelize.define('User',
    {
      uuid: {
        type: DataTypes.UUID,
        default: sequelize.UUIDV4
      },
      email: {
        type      : DataTypes.STRING,
        allowNull : false,
        unique    : true,
        validate  : {
          isEmail: true
        }
      },

      verified      : { type: DataTypes.BOOLEAN, default: false },

      // migration from beta.columby.com
      drupal_name : { type: DataTypes.STRING },
      drupal_created: { type: DataTypes.STRING }


    },{
      classMethods: {
        associate: function(models) {
          User.hasMany(models.Token);
          User.hasMany(models.Account, {through: models.AccountsUsers});
        }
      }
    }
  );

  return User;
};
