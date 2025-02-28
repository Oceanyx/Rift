'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DirectMessage extends Model {
    static associate(models) {
      // Associations
      DirectMessage.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
      
      DirectMessage.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'recipient'
      });
      
      DirectMessage.hasMany(models.DirectMessageReaction, {
        foreignKey: 'direct_message_id',
        as: 'reactions'
      });
      
      // Add attachment association if needed
    }
  }
  
  DirectMessage.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    has_attachment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'DirectMessage',
    tableName: 'direct_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['sender_id', 'recipient_id']
      }
    ]
  });
  
  return DirectMessage;
};