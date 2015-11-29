'use strict';


module.exports = function(sequelize, DataTypes) {

  /**
   *
   * Schema definition
   *
   */
  var Dataset = sequelize.define('Dataset',
    {
      shortid: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      uuid: {
        type: DataTypes.UUID
      },
      title: {
        type: DataTypes.STRING
      },
      slug: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    }, {
      classMethods: {
        associate: function(models) {

          //
          Dataset.belongsTo(models.Account, {
            as:'account'
          });
          
          // Dataset.hasOne(models.Primary, {
          //   as: 'primary'
          // });
        }
      }
    }
  );

  return Dataset;
};
