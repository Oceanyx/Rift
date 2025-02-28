'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Define associations
      Message.belongsTo(models.Channel, { foreignKey: 'channel_id' });
      Message.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' });
      Message.hasMany(models.Attachment, { foreignKey: 'message_id', onDelete: 'CASCADE', hooks: true });
      Message.hasMany(models.MessageReaction, { foreignKey: 'message_id', onDelete: 'CASCADE', hooks: true });
    }
  }

  Message.init({
    channel_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    has_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    underscored: true
  });

  return Message;
};