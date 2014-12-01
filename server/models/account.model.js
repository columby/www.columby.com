'use strict';

var Hashids = require('hashids'),
    hashids = new Hashids('Salt', 8);


/**
 *
 * Slugify a string.
 *
 */
function slugify(text) {

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
                                // Limit characters
}

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Account = sequelize.define('Account',
    {
      uuid: {
        type: DataTypes.UUID
      },
      shortid: {
        type: DataTypes.STRING,
        unique: true
      },
      name: {
        type: DataTypes.STRING
      },
      slug: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },{
      classMethods: {
        // Create associations to other models
        associate: function(models) {

          // Avatar association
          models.File.hasOne(Account, {
            foreignKey: 'avatar_id',
            as: 'Avatar'
          });
          Account.belongsTo(models.File,{
            foreignKey: 'avatar_id',
            as: 'avatar'
          });

          // Header image association
          models.File.hasOne(Account, {
            foreignKey: 'headerimg_id',
            as: 'headerImg'
          });
          Account.belongsTo(models.File,{
            foreignKey: 'headerimg_id',
            as: 'headerImg'
          });

          // An account can have multiple accounts with roles
          Account.hasMany(models.User, {
            through: models.AccountsUsers
          });

          Account.hasMany(models.Dataset);

          Account.hasMany(models.Distribution);

          Account.hasMany(models.Collection);

          //Account.hasMany(models.File);

        }
      }
    }
  );

  /**
   *
   * Create a slug based on the account name
   *
   */
  Account.beforeCreate( function(account, fn){
    account.slug = slugify(account.name);
  });

  /**
   *
   * Set shortid after creating a new account
   *
   */
  Account.afterCreate( function(account) {
    if (!account.shortId) {
      account.updateAttributes({
        shortid: hashids.encode(parseInt(String(Date.now()) + String(account.id)))
      }).success(function(){}).error(function(){});
    }
  });


  return Account;
};
