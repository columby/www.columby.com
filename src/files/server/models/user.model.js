'use strict'

module.exports = function (sequelize, DataTypes) {
  /**
   *
   * Schema definition
   *
   */
  var User = sequelize.define('User', {
    shortid: {
      type: DataTypes.STRING,
      unique: true
    },

    // login type (email, facebook, google, etc).
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // id based on login type. null for email login.
    providerId: {
      type: DataTypes.STRING
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    drupal_uuid: {
      type: DataTypes.STRING
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // Use a specific table for extra fields (role).
        User.belongsToMany(models.Account, {
          as: 'account',
          through: models.UserAccounts
        })
      }
    }
  })

  return User
}
