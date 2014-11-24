'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Token = sequelize.define('Token',
    {
      token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      }
    }, {
      classMethods: {
        associate: function (models) {
          Token.belongsTo(models.User)
        }
      }
    }
  );

  return Token;
};
