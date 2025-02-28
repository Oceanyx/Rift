'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageReaction extends Model {
    static associate(models) {
      // Associations
      MessageReaction.belongsTo(models.Message, {
        foreignKey: 'message_id',
        as: 'message'
      });
      
      MessageReaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      MessageReaction.belongsTo(models.Emoji, {
        foreignKey: 'emoji_id',
        as: 'emoji'
      });
    }
  }
  
  MessageReaction.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    emoji_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'emojis',
        key: 'id'
      }
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'MessageReaction',
    tableName: 'message_reactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['message_id', 'user_id', 'emoji_id']
      }
    ]
  });
  
  return MessageReaction;
};