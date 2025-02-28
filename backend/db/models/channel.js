'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    static associate(models) {
      // Define associations
      Channel.belongsTo(models.Server, { foreignKey: 'server_id' });
      Channel.hasMany(models.Message, { foreignKey: 'channel_id', onDelete: 'CASCADE', hooks: true });
    }
  }

  Channel.init({
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'text',
      validate: {
        isIn: [['text', 'voice', 'announcement']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Channel',
    underscored: true
  });

  return Channel;
};