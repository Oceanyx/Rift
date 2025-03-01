'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DirectMessageReaction extends Model {
    static associate(models) {
      // Associations
      DirectMessageReaction.belongsTo(models.DirectMessage, {
        foreignKey: 'direct_message_id',
        as: 'directMessage'
      });
      
      DirectMessageReaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      DirectMessageReaction.belongsTo(models.Emoji, {
        foreignKey: 'emoji_id',
        as: 'emoji'
      });
    }
  }
  
  DirectMessageReaction.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    direct_message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'direct_messages',
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
    modelName: 'DirectMessageReaction',
    tableName: 'direct_message_reactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['direct_message_id', 'user_id', 'emoji_id']
      }
    ]
  });
  
  return DirectMessageReaction;
};