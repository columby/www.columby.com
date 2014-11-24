'use strict';

var uuid = require('node-uuid');

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Token = sequelize.define('Token',
    {
      token: {
        type: DataTypes.STRING,
        default: uuid.v4()
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
