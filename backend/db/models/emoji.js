'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Emoji extends Model {
    static associate(models) {
      // Associations
      Emoji.belongsTo(models.Server, {
        foreignKey: 'server_id',
        as: 'server'
      });
      
      Emoji.hasMany(models.MessageReaction, {
        foreignKey: 'emoji_id',
        as: 'messageReactions'
      });
      
      Emoji.hasMany(models.DirectMessageReaction, {
        foreignKey: 'emoji_id',
        as: 'directMessageReactions'
      });
    }
  }
  
  Emoji.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unicode_character: {
      type: DataTypes.STRING,
      allowNull: true
    },
    custom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'servers',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Emoji',
    tableName: 'emojis',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  
  return Emoji;
};