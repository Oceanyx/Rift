'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      // Define associations
      Attachment.belongsTo(models.Message, { foreignKey: 'message_id' });
    }
  }

  Attachment.init({
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Attachment',
    underscored: true,
    timestamps: false
  });

  return Attachment;
};