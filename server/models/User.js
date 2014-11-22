'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var User = sequelize.define('User',
    {
      displayName: { type: DataTypes.STRING },

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
      drupal_uid  : { type: DataTypes.STRING },
      drupal_uuid : { type: DataTypes.STRING },
      drupal_name : { type: DataTypes.STRING }

    },{
      classMethods: {
        associate: function(models) {
          User.hasMany(models.Token);
          User.hasMany(models.Account);
        }
      }
    }
  );

  return User;
};
