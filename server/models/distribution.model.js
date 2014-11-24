'use strict';

var Hashids = require('hashids'),
  hashids = new Hashids('Salt', 8);

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Distribution = sequelize.define('Distribution',
    {
      shortid:{
        type: DataTypes.STRING,
        unique: true
      },
      title: {
        type: DataTypes.STRING
      },
      type: {
        // external link, internal storage, internal api
        type: DataTypes.STRING
      },
      private: {
        type: DataTypes.BOOLEAN,
        default: true
      },

      // DCAT
      description     : { type: DataTypes.STRING },
      issued          : { type: DataTypes.DATE },
      modified        : { type: DataTypes.DATE },
      license         : { type: DataTypes.INTEGER },
      rights          : { type: DataTypes.STRING },
      accessUrl       : { type: DataTypes.STRING },
      downloadUrl     : { type: DataTypes.STRING },
      mediaType       : { type: DataTypes.STRING },
      format          : { type: DataTypes.STRING },
      byteSize        : { type: DataTypes.INTEGER },

      // sync status for external api syncs
      syncPeriod      : { type: DataTypes.INTEGER },
      lastSync        : { type: DataTypes.DATE },

    },{
      classMethods: {
        associate: function(models) {
          Distribution.belongsTo(models.Dataset);
          Distribution.belongsTo(models.Account);
        }
      }
    }
  );

  /**
   *
   * Set shortid after creating a new account
   *
   */
  Distribution.afterCreate( function(model) {
    model.updateAttributes({
      shortid: hashids.encode(parseInt(String(Date.now()) + String(model.id)))
    }).success(function(){}).error(function(){});
  });

  return Distribution;
};
