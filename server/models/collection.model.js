'use strict';

var Hashids = require('hashids'),
    hashids = new Hashids('Salt', 8);


module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Collection = sequelize.define('Collection',
    {
      title: {
        type: DataTypes.STRING
      },
      shortid: {
        type: DataTypes.STRING,
        unique: true
      }

    },{
      classMethods: {
        associate: function(models) {
          Collection.belongsTo(models.Account);
          Collection.hasMany(models.Dataset);
        }
      }
    }
  );

  /**
   *
   * Set shortid after creating a new account
   *
   */
  Collection.afterCreate( function(model) {
    model.updateAttributes({
      shortid: hashids.encode(parseInt(String(Date.now()) + String(model.id)))
    }).success(function(){}).error(function(){});
  });

  return Collection;
};
