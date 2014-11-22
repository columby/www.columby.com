'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Distribution = sequelize.define('Distribution',
    {
      // Columby
      title           : { type: DataTypes.STRING },
      type            : { type: DataTypes.STRING },      // external link, internal storage, internal api
      private         : { type: DataTypes.BOOLEAN, default: true },

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

  return Distribution;
};
