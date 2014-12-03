'use strict';

var Hashids = require('hashids'),
  hashids = new Hashids('Salt', 8);

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Tag = sequelize.define('Tag',
    {
      shortid: {
        type: DataTypes.STRING,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    },{
      classMethods: {
        associate: function(models) {
          Tag.hasMany(models.Dataset);
        }
      }
    }
  );

  /**
   *
   * Set shortid after creating a new account
   *
   */
  Tag.afterCreate( function(model) {
    model.updateAttributes({
      shortid: hashids.encode(parseInt(String(Date.now()) + String(model.id)))
    }).success(function(){}).error(function(){});
  });

  return Tag;
};
