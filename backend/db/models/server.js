'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Server extends Model {
    static associate(models) {
      // Define associations
      Server.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
      Server.hasMany(models.Channel, { foreignKey: 'server_id', onDelete: 'CASCADE', hooks: true });
      Server.belongsToMany(models.User, { 
        through: models.ServerMember, 
        foreignKey: 'server_id',
        otherKey: 'user_id'
      });
      Server.hasMany(models.Role, { foreignKey: 'server_id', onDelete: 'CASCADE', hooks: true });
      // Server.hasMany(models.Emoji, { foreignKey: 'server_id', onDelete: 'CASCADE', hooks: true });
    }
  }

  Server.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Server',
  });

  return Server;
};