'use strict';

var path = require('path');

module.exports = function(sequelize, DataTypes) {

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

  /**
   *
   * Schema definition
   *
   */
  var File = sequelize.define('File', {

      type: {
        type: DataTypes.ENUM,
        values: [ 'image', 'datafile', 'file' ]
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filetype: {
        type: DataTypes.STRING
      },
      title: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      url: {
        type: DataTypes.STRING,
        isUrl: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      size: {
        type: DataTypes.INTEGER
      }
    }, {
      classMethods: {
        // Create associations to other models
        associate: function (models) {
          // An account can have multiple accounts with roles
          File.belongsTo(models.Account);
        }
      }
    }
  );

  /**
   *
   * Create a slug based on the account name
   *
   */
  File.beforeCreate( function(model, fn){
    var filename = model.filename;
    var ext = path.extname(filename);
    var basename = path.basename(filename, ext);
    filename = slugify(basename) + ext;
    model.filename = filename;
  });

  File.afterCreate(function(model,fn) {
    var filename = model.filename;
    var id = model.id;
    var ext = path.extname(filename);
    var basename = path.basename(filename, ext);
    model.updateAttributes({
      filename: basename + '-' + id + ext
    }).success(function () {

    }).error(function () {

    });
  });

  return File;
};
