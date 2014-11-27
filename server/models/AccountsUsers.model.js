'use strict';

module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var AccountsUsers = sequelize.define('AccountsUsers', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role: DataTypes.INTEGER
    });

  return AccountsUsers ;
};
