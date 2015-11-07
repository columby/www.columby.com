'use strict'

module.exports = function (sequelize, DataTypes) {
  /**
   *
   * Schema definition
   *
   */
  var Account = sequelize.define('Account', {
    shortid: {
      type: DataTypes.STRING,
      unique: true
    },

    // Public displayname
    displayName: {
      type: DataTypes.STRING,
      required: true,
      unique: true
    },

    // automatically generated slug
    slug: {
      type: DataTypes.STRING,
      unique: true
    },

    // Public email
    email: {
      type: DataTypes.STRING
    },

    // Public description
    description: {
      type: DataTypes.TEXT
    },

    // This account is a primary account for a user or not
    primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    plan: {
      type: DataTypes.STRING,
      defaultValue: 'free'
    },

    contact: {
      type: DataTypes.TEXT
    },

    url: {
      type: DataTypes.STRING
    },

    location: {
      type: DataTypes.STRING
    },

    uuid: {
      type: DataTypes.UUID
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    classMethods: {
      // Create associations to other models
      associate: function (models) {
        // Each account can have a reference to a File (image) as avatarImage
        // creates Account.avatar_id
        Account.belongsTo(models.File, {
          foreignKey: 'avatar_id',
          as: 'avatar'
        })

        // Each account can have a reference to a File (image) as headerImage
        // creates Account.headerimg_id
        Account.belongsTo(models.File, {
          foreignKey: 'headerimg_id',
          as: 'headerImg'
        })

        // A user can have multiple accounts with roles
        Account.belongsToMany(models.User, {
          as: 'users',
          through: models.UserAccounts
        })
      }
    }
  })

  return Account
}
